import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import {
  Address,
  ContractFunctionRevertedErrorType,
  TransactionExecutionErrorType,
  zeroAddress,
} from "viem";
import { useConfig } from "wagmi";
import { CryptroviaABI, CryptroviaAddress } from "../../providers/Contract/abi";
import { BigNumber } from "ethers";
import {
  redeemProduct,
} from "../../services/apiService";
import { useAPI } from "../../apiContext";
import {
  getTransactionConfirmations,
  simulateContract,
  watchBlockNumber,
  writeContract,
} from "wagmi/actions";
import { ReactComponent as CheckMarkIcon } from "../../asserts/icons/check-mark.svg";
import { ReactComponent as ThreeDotsBounce } from "../../asserts/icons/3dots-bounce.svg";
import { ReactComponent as ThreeDots } from "../../asserts/icons/3dots.svg";
import { ReactComponent as ErrorIcon } from "../../asserts/icons/error.svg";
import RegistrationForm from "./Kyc";

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
    title: "Redeem the token",
    state: LoadingState.PENDING,
  },
  {
    title: "Confirming the transaction",
    state: LoadingState.PENDING,
  },
];

const RedeemModal = ({
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

  const mintWithETH = async () => {
    try {
      // Step 1: Fetch Metadata
      const response = await getMetadata(
        0,
        orderId,
        paymentToken,
        walletAddress
      );
      console.log("Redeem response:", response);

      // Check if the metadata exists
      if (!response.data || !response.data.signature) {
        setMetaDataExists(false);
      } else {
        const redeemData = response.data;
        setMetaDataExists(true);
        await processRedeemWithETH(
          1,
          redeemData.ids ?? [],
          redeemData.amounts ?? [],
          redeemData.orderId ?? "",
          redeemData.fee,
          walletAddress,
          redeemData.signature,
          redeemData.timestamp
        );
      }
    } catch (error) {}
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

  const processRedeemWithETH = async (
    _stepNumber: number,
    _ids: string[],
    _amounts: string[],
    _orderId: string,
    _feeInWei: string,
    _walletAddress: Address,
    _signature: string,
    _timestamp: string
  ) => {
    setSteps((steps_) => {
      const newSteps = steps_.slice();
      newSteps[_stepNumber] = {
        ...newSteps[_stepNumber],
        state: LoadingState.IN_PROGRESS,
      };
      return newSteps;
    });
    const paymentToken = zeroAddress;
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
          paymentToken,
          BigNumber.from(_feeInWei).toBigInt(),
          _signature,
        ],
        value: BigNumber.from(_feeInWei).toBigInt(),
      });
    } catch (error: any) {
      const _e = error as ContractFunctionRevertedErrorType;
      setSteps((steps_) => {
        const newSteps = steps_.slice();
        newSteps[_stepNumber] = {
          ...newSteps[_stepNumber],
          state: LoadingState.FAILED,
        };
        newSteps[1] = { ...newSteps[1], state: LoadingState.IN_PROGRESS };
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
        ],
        value: BigNumber.from(_feeInWei).toBigInt(),
      });

      setTxHash(hash);
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

      const unwatch = watchBlockNumber(config, {
        onBlockNumber: async (blockNumber) => {
          const confirmations = await getTransactionConfirmations(config, {
            hash,
          });
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
      onAfterOpen={mintWithETH}
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
                ? "Register to Mint Token"
                : "Token Minting Process"}
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
                {txCompleted && (
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

export default RedeemModal;
