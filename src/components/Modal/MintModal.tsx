import ReactModal from "react-modal";
import {
  Address,
  ContractFunctionRevertedErrorType,
  TransactionExecutionErrorType,
  zeroAddress,
} from "viem";
import { ReactComponent as CheckMarkIcon } from "../../asserts/icons/check-mark.svg";
import { ReactComponent as ThreeDotsBounce } from "../../asserts/icons/3dots-bounce.svg";
import { ReactComponent as ThreeDots } from "../../asserts/icons/3dots.svg";
import { ReactComponent as ErrorIcon } from "../../asserts/icons/error.svg";
import { useConfig } from "wagmi";
import { CryptroviaABI, CryptroviaAddress } from "../../providers/Contract/abi";
import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { getMintPriceAndSignature } from "../../services/apiService";
import {
  getTransactionConfirmations,
  simulateContract,
  watchBlockNumber,
  writeContract,
} from "wagmi/actions";

interface MintModalProps {
  setShowMintModal: (show: boolean) => void;
  showMintModal: boolean;
  walletAddress: Address;
  sku: string;
  quantity: number;
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
    title: "Getting token metadata",
    state: LoadingState.IN_PROGRESS,
  },
  {
    title: "Getting token spending approval",
    state: LoadingState.PENDING,
  },
  {
    title: "Minting the token",
    state: LoadingState.PENDING,
  },
  {
    title: "Confirming the transaction",
    state: LoadingState.PENDING,
  },
];

const MintModal = ({
  setShowMintModal,
  showMintModal,
  walletAddress,
  sku,
  quantity,
  paymentToken,
}: MintModalProps) => {
  const _localSteps = JSON.parse(JSON.stringify(_steps));
  const localSteps = [_localSteps[0]];
  localSteps.push(_localSteps[2], _localSteps[3]);
  const [steps, setSteps] = useState<Step[]>(localSteps);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txCompleted, setTxCompleted] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const config = useConfig();

  useEffect(() => {
    ReactModal.setAppElement("body");
    setTxHash(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mintWithETH = async () => {
    try {
      // Step 1
      const metaData = await getMetadata(0, walletAddress, paymentToken, sku);

      // Step 2
      await processMintWithETH(
        1,
        walletAddress,
        metaData.price,
        quantity,
        metaData.sku,
        metaData.signature,
        metaData.timestamp
      );
    } catch (error) {}
  };

  const getMetadata = async (
    _stepNumber: number,
    _walletAddress: Address,
    _paymentToken: Address,
    _sku: string
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
      const metaData = await getMintPriceAndSignature(
        "",
        _walletAddress,
        _paymentToken,
        _sku
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

  const processMintWithETH = async (
    _stepNumber: number,
    _walletAddress: Address,
    _price: BigNumber,
    _quantity: number,
    _sku: string,
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
    try {
      await simulateContract(config, {
        abi: CryptroviaABI,
        address: CryptroviaAddress,
        functionName: "mint",
        args: [
          _walletAddress,
          _sku,
          zeroAddress,
          BigNumber.from(_price).toBigInt(),
          _quantity,
          _timestamp,
          _signature,
        ],
        value: BigNumber.from(_price).mul(_quantity).toBigInt(),
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
    // send transaction to mint token
    try {
      const hash = await writeContract(config, {
        abi: CryptroviaABI,
        address: CryptroviaAddress,
        functionName: "mint",
        args: [
          _walletAddress,
          _sku,
          zeroAddress,
          BigNumber.from(_price).toBigInt(),
          _quantity,
          _timestamp,
          _signature,
        ],
        value: BigNumber.from(_price).mul(_quantity).toBigInt(),
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

  return (
    <ReactModal
      isOpen={showMintModal}
      onAfterOpen={() => {
        mintWithETH();
      }}
      contentLabel="Minimal Modal Example"
      className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
      overlayClassName="overlay z-30 overflow-hidden"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 w-full">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-96">
              <h3 className="text-2xl font-semibold text-gray-900">
                Minting in progress
              </h3>
              <div className="mt-2">
                <ul className="list-inside list-none pl-5 text-left">
                  {steps.map((step, i) => (
                    <li className="text-base leading-6 text-gray-500" key={i}>
                      <div className="flex items-center">
                        {GetStatusIcon(step.state)} {step.title}
                      </div>
                    </li>
                  ))}
                  {errorMessage && (
                    <li className="text-red-500 text-base leading-6">
                      <span className="block font-semibold">Error: </span>
                      <span>{errorMessage}</span>
                    </li>
                  )}
                </ul>
              </div>
              {txHash && (
                <div className="my-3">
                  <a
                    href={`https://etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    View on Etherscan
                  </a>
                </div>
              )}
            </div>
          </div>
          {(txCompleted || errorMessage != null) && (
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse justify-center">
              <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto mx-2">
                <button
                  onClick={() => setShowMintModal(false)}
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                >
                  Close
                </button>
              </span>
            </div>
          )}
        </div>
      </div>
    </ReactModal>
  );
};

export default MintModal;
