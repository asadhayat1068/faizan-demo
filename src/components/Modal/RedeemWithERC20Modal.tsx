import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import {
  Address,
  ContractFunctionRevertedErrorType,
  TransactionExecutionErrorType,
  zeroAddress,
  erc20Abi
} from "viem";
import { useConfig } from "wagmi";
import { CryptroviaABI, CryptroviaAddress, ERC20ABI } from "../../providers/Contract/abi";
import { BigNumber } from "ethers";
import {
  redeemProduct,
} from "../../services/apiService";
import { useAPI } from "../../apiContext";
import {
  getTransactionConfirmations,
  readContract,
  simulateContract,
  watchBlockNumber,
  writeContract,
} from "wagmi/actions";
import { ReactComponent as CheckMarkIcon } from "../../asserts/icons/check-mark.svg";
import { ReactComponent as ThreeDotsBounce } from "../../asserts/icons/3dots-bounce.svg";
import { ReactComponent as ThreeDots } from "../../asserts/icons/3dots.svg";
import { ReactComponent as ErrorIcon } from "../../asserts/icons/error.svg";
import RegistrationForm from "./Kyc";
import { USDTABI } from "../../providers/Contract/usdt_abit";
import { Link, redirect } from "react-router-dom";

interface RedeemModalProps {
  setShowModal: (show: boolean) => void;
  showModal: boolean;
  walletAddress: Address;
  orderId: string;
  paymentToken: Address;
}

enum LoadingState {
  DONE,
  IN_PROGRESS,
  PENDING,
  FAILED,
}

type Step = {
  title: string;
  state: LoadingState;
  error?: Error;
};

const _steps: Step[] = [
  {
    title: "Getting redeem signature",
    state: LoadingState.IN_PROGRESS,
  },
  {
    title: "Checking user balance",
    state: LoadingState.PENDING,
  },
  {
    title: "Getting token spending approval",
    state: LoadingState.PENDING,
  },
  {
    title: "Waiting for approval transaction confirmation",
    state: LoadingState.PENDING,
  },
  {
    title: "Redeeming the token",
    state: LoadingState.PENDING,
  },
  {
    title: "Waiting for redeem transaction confirmation",
    state: LoadingState.PENDING,
  },
];

const RedeemWithERC20Modal = ({
  setShowModal,
  showModal,
  walletAddress,
  orderId,
  paymentToken,
}: RedeemModalProps) => {
  const _localSteps = JSON.parse(JSON.stringify(_steps));
  // const localSteps = [_localSteps[0]];
  // localSteps.push(_localSteps[2], _localSteps[3]);
  const [steps, setSteps] = useState<Step[]>(_localSteps);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txCompleted, setTxCompleted] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [metaDataExists, setMetaDataExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const config = useConfig();
  const { handleAddUser } = useAPI();
  useEffect(() => {
    ReactModal.setAppElement("body");
    setTxHash(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redeemWithERC20 = async () => {
    try {
      // Step 0
      const redeemData = (await getMetadata(0, orderId, paymentToken, walletAddress)).data;
      // Step 1
      const fee = BigNumber.from(redeemData.fee)
      await verifyUserBalance(1, walletAddress, paymentToken, fee);
      // Step 2-3
      await processERC20Approval(
        2,
        walletAddress,
        paymentToken,
        fee
      );
      // Step 4-5
      console.log("Starting Redemption with ERC20");
      await processRedeemWithERC20(
        4,
        redeemData.ids ?? [],
        redeemData.amounts ?? [],
        redeemData.orderId ?? "",
        redeemData.fee,
        walletAddress,
        paymentToken,
        redeemData.signature,
        redeemData.timestamp
      );
    } catch (error) {
      if (errorMessage == null) {
        setErrorMessage((err) => {
          if (err == null) {
            return "An unexpected error has been encountered";
          }
          return err;
        });
      }
      setTxCompleted(true);
    }
  };

  const getMetadata = async (
    _stepNumber: number,
    _orderId: string,
    _paymentToken: string,
    _walletAddress: string
  ) => {
    setSteps((steps_) => {
      const newSteps = steps_.slice();
      newSteps[_stepNumber] = {
        ...newSteps[_stepNumber],
        state: LoadingState.IN_PROGRESS,
      };
      return newSteps;
    });

    try {
      // const token = await fetchToken();
      const metaData = await redeemProduct(
        orderId,
        paymentToken,
        walletAddress
      );

      setSteps((steps_) => {
        const newSteps = steps_.slice();
        newSteps[_stepNumber] = {
          ...newSteps[_stepNumber],
          state: LoadingState.DONE,
        };
        return newSteps;
      });

      return metaData;
    } catch (e) {
      setSteps((steps_) => {
        const newSteps = steps_.slice();
        newSteps[_stepNumber] = {
          ...newSteps[_stepNumber],
          state: LoadingState.FAILED,
        };
        return newSteps;
      });
      setErrorMessage("An error occurred while fetching metadata");
      throw e;
    }
  };

  const verifyUserBalance = async (
    _stepNumber: number,
    _walletAddress: Address,
    _paymentToken: Address,
    _price: BigNumber
  ) => {
    setSteps((steps_) => {
      const newSteps = steps_.slice();
      newSteps[_stepNumber] = {
        ...newSteps[_stepNumber],
        state: LoadingState.IN_PROGRESS,
      };
      return newSteps;
    });
    // Simulate Balance Check
    try {
      const result = await readContract(config, {
        abi: erc20Abi,
        address: paymentToken,
        functionName: "balanceOf",
        args: [_walletAddress],
      });
      const totalPrice = BigNumber.from(_price).toBigInt();
      if (result < totalPrice) {
        throw new Error("Insufficient balance");
      }
    } catch (error: any) {
      setSteps((steps_) => {
        const newSteps = steps_.slice();
        newSteps[_stepNumber] = {
          ...newSteps[_stepNumber],
          state: LoadingState.FAILED,
        };
        return newSteps;
      });
      setErrorMessage("Insufficient balance");
      setTxCompleted(true);
      throw new Error("Error: Insufficient balance");
    }
    setSteps((steps_) => {
      const newSteps = steps_.slice();
      newSteps[_stepNumber] = {
        ...newSteps[_stepNumber],
        state: LoadingState.DONE,
      };
      return newSteps;
    });
  };

  const processERC20Approval = async (
    _stepNumber: number,
    _walletAddress: Address,
    _paymentToken: Address,
    _price: BigNumber
  ) => {
    console.log("Starting Step 2");
    setSteps((steps_) => {
      const newSteps = steps_.slice();
      newSteps[_stepNumber] = {
        ...newSteps[_stepNumber],
        state: LoadingState.IN_PROGRESS,
      };
      return newSteps;
    });
    // Simulate Approval
    try {
      await simulateContract(config, {
        abi: USDTABI,
        address: paymentToken,
        functionName: "approve",
        args: [
          CryptroviaAddress,
          BigNumber.from(_price).toBigInt(),
        ],
      });
    } catch (error: any) {
      console.log("Simulate Approval Error: ", { error });
      const _e = error as ContractFunctionRevertedErrorType;
      // if (_e.shortMessage.indexOf("returned no data") === -1) {
      console.log("throwing after no data Approval Error");
      setSteps((steps_) => {
        const newSteps = steps_.slice();
        newSteps[_stepNumber] = {
          ...newSteps[_stepNumber],
          state: LoadingState.FAILED,
        };
        return newSteps;
      });
      setErrorMessage(getErrorMessage(_e.shortMessage));
      throw error;
      // }
    }
    // Send Approval Transaction
    try {
      const hash = await writeContract(config, {
        abi: USDTABI,
        address: paymentToken,
        functionName: "approve",
        args: [
          CryptroviaAddress,
          BigNumber.from(_price).toBigInt(),
        ],
      });
      console.log("Step 2 Done");
      setSteps((steps_) => {
        const newSteps = steps_.slice();
        newSteps[_stepNumber] = {
          ...newSteps[_stepNumber],
          state: LoadingState.DONE,
        };
        newSteps[_stepNumber + 1] = {
          ...newSteps[_stepNumber + 1],
          state: LoadingState.IN_PROGRESS,
        };
        return newSteps;
      });
      console.log("Step 3 Started");
      // Watch for confirmations
      await new Promise((resolve) => {
        const unwatch = watchBlockNumber(config, {
          onBlockNumber: async (blockNumber) => {
            const confirmations = await getTransactionConfirmations(config, {
              hash,
            });
            if (confirmations >= 3) {
              setSteps((steps_) => {
                const newSteps = steps_.slice();
                newSteps[_stepNumber + 1] = {
                  ...newSteps[_stepNumber + 1],
                  state: LoadingState.DONE,
                };
                return newSteps;
              });
              console.log("STEP3 DONE", _stepNumber);
              unwatch();
              resolve("done");
            }
          },
        });
      });
      return;
    } catch (error) {
      console.log("Approval Tx Err: ", { error });
      const _e = error as TransactionExecutionErrorType;
      if (_e.shortMessage.indexOf("returned no data") === -1) {
        setSteps((steps_) => {
          const newSteps = steps_.slice();
          newSteps[_stepNumber] = {
            ...newSteps[_stepNumber],
            state: LoadingState.FAILED,
          };
          return newSteps;
        });
        setErrorMessage(getErrorMessage(_e.shortMessage));
        setTxCompleted(true);
        throw error;
      }
    }
  };

  const processRedeemWithERC20 = async (
    _stepNumber: number,
    _ids: string[],
    _amounts: string[],
    _orderId: string,
    _feeInWei: string,
    _walletAddress: Address,
    _paymentToken: Address,
    _signature: string,
    _timestamp: string
  ) => {
    console.log("STEP 4 LOADING")
    setSteps((steps_) => {
      const newSteps = steps_.slice();
      newSteps[_stepNumber] = {
        ...newSteps[_stepNumber],
        state: LoadingState.IN_PROGRESS,
      };
      return newSteps;
    });
    try {
      await simulateContract(config, {
        abi: CryptroviaABI,
        address: CryptroviaAddress,
        functionName: "redeem",
        args: [
          _ids,
          _amounts,
          _orderId,
          _timestamp,
          _paymentToken,
          BigNumber.from(_feeInWei).toBigInt(),
          _signature,
        ]
      });
    } catch (error: any) {
      console.log("Caught Error: ", error);
      const _e = error as ContractFunctionRevertedErrorType;
      setSteps((steps_) => {
        const newSteps = steps_.slice();
        newSteps[_stepNumber] = {
          ...newSteps[_stepNumber],
          state: LoadingState.FAILED,
        };
        // newSteps[_stepNumber] = { ...newSteps[_stepNumber], state: LoadingState.IN_PROGRESS };
        return newSteps;
      });
      setErrorMessage(getErrorMessage(_e.shortMessage));
    }

    try {
      const hash = await writeContract(config, {
        abi: CryptroviaABI,
        address: CryptroviaAddress,
        functionName: "redeem",
        args: [
          _ids,
          _amounts,
          _orderId,
          _timestamp,
          paymentToken,
          BigNumber.from(_feeInWei).toBigInt(),
          _signature,
        ]
      });
      console.log("STEP 4 DONE");
      setTxHash(hash);
      console.log(_stepNumber);
      setSteps((steps_) => {
        const newSteps = steps_.slice();
        newSteps[_stepNumber] = {
          ...newSteps[_stepNumber],
          state: LoadingState.DONE,
        };
        newSteps[_stepNumber + 1] = {
          ...newSteps[_stepNumber + 1],
          state: LoadingState.IN_PROGRESS,
        };
        return newSteps;
      });

      console.log("STEP 5 LOADING");
      const unwatch = watchBlockNumber(config, {
        onBlockNumber: async (blockNumber) => {
          let confirmations: bigint = BigInt(0);
          while(true) {
            try {
              confirmations = await getTransactionConfirmations(config, {
                hash,
              });
              if(confirmations >3) {break;} 
            } catch (e) {
              continue;
            }
          }

          if (confirmations >= 3) {
            unwatch();
            setSteps((steps_) => {
              const newSteps = steps_.slice();
              newSteps[_stepNumber + 1] = {
                ...newSteps[_stepNumber + 1],
                state: LoadingState.DONE,
              };
              return newSteps;
            });
            setTxCompleted(true);
          }
        },
      });
      console.log("STEP 5 DONE");
    } catch (error) {
      const _e = error as TransactionExecutionErrorType;
      setSteps((steps_) => {
        const newSteps = steps_.slice();
        newSteps[_stepNumber] = {
          ...newSteps[_stepNumber],
          state: LoadingState.FAILED,
        };
        return newSteps;
      });
      setErrorMessage(getErrorMessage(_e.shortMessage));
      setTxCompleted(true);
    }
  };

  const GetStatusIcon = (state: LoadingState) => {
    const style = "w-4 h-4 mx-2";
    switch (state) {
      case LoadingState.DONE:
        return <CheckMarkIcon className={style} />;
      case LoadingState.IN_PROGRESS:
        return <ThreeDotsBounce className={style} />;
      case LoadingState.PENDING:
        return <ThreeDots className={style} />;
      case LoadingState.FAILED:
        return <ErrorIcon className={style} />;
    }
    return <></>;
  };

  const getErrorMessage = (_unformattedError: string): string => {
    const errors = _unformattedError.split(":");
    return errors[errors.length - 1];
  };

  const handleRegistrationSubmit = async (formData: {
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    setLoading(true); // Start loading
    try {
      await handleAddUser(
        formData.firstName,
        formData.lastName,
        formData.email,
        walletAddress
      );
      setLoading(false);
      setMetaDataExists(true); // Set metaDataExists to true after successful registration
      setShowModal(false); // Close the mint modal

      // Reopen the mint modal after 2 seconds
      setTimeout(() => {
        setShowModal(true);
      }, 2000);
    } catch (error) {
      console.error("Registration failed", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-8 w-8 text-blue-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
      ></path>
    </svg>
  );

  return (
    <ReactModal
      isOpen={showModal}
      onAfterOpen={redeemWithERC20}
      contentLabel="Minimal Modal Example"
      className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
      overlayClassName="overlay z-30 overflow-hidden"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 w-full">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
        <div
          className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full sm:p-6"
          style={{ maxWidth: "600px", width: "80%" }}
        >
          <div className="mt-3 text-center sm:mt-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {metaDataExists === false
                ? "Register to Redeem Token"
                : "Token Redemption Process"}
            </h3>
            {loading ? (
              <div className="flex justify-center items-center mt-5">
                <LoadingSpinner />
              </div>
            ) : metaDataExists === false ? (
              <RegistrationForm onSubmit={handleRegistrationSubmit} />
            ) : (
              <>
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="mt-3 flex items-center text-sm font-medium text-gray-500"
                  >
                    {GetStatusIcon(step.state)}
                    <span className="mx-2">{step.title}</span>
                  </div>
                ))}
                {errorMessage && (
                  <div className="mt-3 text-sm text-red-500">
                    {errorMessage}
                  </div>
                )}
                {txHash && (
                  <div className="mt-3 text-sm text-gray-500">
                    Transaction Hash: {txHash}
                  </div>
                )}
                
                {!errorMessage && txCompleted && (
                  <Link
                    to={`/success/${orderId}`}
                    onClick={() => setShowModal(false)}
                  >
                  <button
                    className="mt-5 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  >
                    Close
                  </button></Link>
                )}
                {errorMessage && txCompleted && (
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-5 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  >
                    Close
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ReactModal>
  );
};

export default RedeemWithERC20Modal;
