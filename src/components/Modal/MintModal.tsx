import ReactModal from "react-modal";
import {
  Address,
  ContractFunctionRevertedErrorType,
  erc20Abi,
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
import { useState } from "react";
import { getMintPriceAndSignature } from "../../services/apiService";
import { simulateContract, writeContract } from "wagmi/actions";

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
  if (paymentToken !== zeroAddress) {
    localSteps.push(_localSteps[1]);
  }
  localSteps.push(_localSteps[2]);
  const [steps, setSteps] = useState<Step[]>(localSteps);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txCompleted, setTxCompleted] = useState<boolean>(false);

  const config = useConfig();

  async function startMinting() {
    if (paymentToken === zeroAddress) {
      mintWithETH();
    } else {
      mintWithERC20();
    }
  }

  const mintWithETH = async () => {
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
  };

  const mintWithERC20 = async () => {
    // Step 1
    const metaData = await getMetadata(0, walletAddress, paymentToken, sku);
    // console.log("Meta Data: ", metaData);
    // Step 2
    await processERC20Approval(
      1,
      walletAddress,
      paymentToken,
      metaData.price,
      quantity
    );
  };

  const getMetadata = async (
    _stepNumber: number,
    _walletAddress: Address,
    _paymentToken: Address,
    _sku: string
  ) => {
    try {
      const metaData = await getMintPriceAndSignature(
        "",
        _walletAddress,
        _paymentToken,
        _sku
      );
      console.log("Steps 1: ", steps);
      setSteps((steps_) => {
        steps_[_stepNumber].state = LoadingState.DONE;
        steps_[_stepNumber + 1].state = LoadingState.IN_PROGRESS;
        return steps_;
      });
      console.log("Steps 2: ", steps);
      return metaData;
    } catch (e) {
      console.log("Step 0 Error: ", e);
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
    let result;
    try {
      result = await simulateContract(config, {
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
      console.log("Mint with ETH Error: ", { _e });
      setSteps((steps_) => {
        steps_[_stepNumber].state = LoadingState.FAILED;
        return steps_;
      });
      setErrorMessage(getErrorMessage(_e.shortMessage));
    }
    console.log("Simulate ETH Mint Result: ", result);
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
      setSteps((steps_) => {
        steps_[_stepNumber].state = LoadingState.DONE;
        return steps_;
      });
      setTxCompleted(true);
      console.log({ hash });
    } catch (error) {
      console.log("Mint Err: ", { error });
      const _e = error as TransactionExecutionErrorType;
      setSteps((steps_) => {
        steps_[_stepNumber].state = LoadingState.FAILED;
        return steps_;
      });
      setErrorMessage(getErrorMessage(_e.shortMessage));
      setTxCompleted(true);
    }
  };

  const processERC20Approval = async (
    _stepNumber: number,
    _walletAddress: Address,
    _paymentToken: Address,
    _price: BigNumber,
    _quantity: number
  ) => {
    let result;
    try {
      result = await simulateContract(config, {
        abi: erc20Abi,
        address: _paymentToken,
        functionName: "approve",
        args: [
          CryptroviaAddress,
          BigNumber.from(_price).mul(_quantity).toBigInt(),
        ],
      });
    } catch (error: any) {
      const _e = error as ContractFunctionRevertedErrorType;
      console.log("Approval Error: ", { _e });
      setSteps((steps_) => {
        steps_[_stepNumber].state = LoadingState.FAILED;
        return steps_;
      });
      setErrorMessage(getErrorMessage(_e.shortMessage));
    }
    console.log("Simulate ERC20 Approval Result: ", result);

    // send transaction to approve tokens
    try {
      const hash = await writeContract(config, {
        abi: erc20Abi,
        address: _paymentToken,
        functionName: "approve",
        args: [
          CryptroviaAddress,
          BigNumber.from(_price).mul(_quantity).toBigInt(),
        ],
      });
      setSteps((steps_) => {
        steps_[_stepNumber].state = LoadingState.DONE;
        steps_[_stepNumber + 1].state = LoadingState.IN_PROGRESS;
        return steps_;
      });
      console.log({ hash });
    } catch (error) {
      console.log("Approval Err: ", { error });
      const _e = error as TransactionExecutionErrorType;
      setSteps((steps_) => {
        steps_[_stepNumber].state = LoadingState.FAILED;
        return steps_;
      });
      setErrorMessage(getErrorMessage(_e.shortMessage));
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
        startMinting();
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
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
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
                </ul>
              </div>
              {errorMessage && (
                <p className="text-red-500">
                  <span className="block font-semibold">Error: </span>
                  <span>{errorMessage}</span>
                </p>
              )}
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto mx-2">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-green-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus:shadow-outline-green transition ease-in-out duration-150 sm:text-sm sm:leading-5"
              >
                Accept
              </button>
            </span>
            <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto mx-2">
              <button
                onClick={() => setShowMintModal(false)}
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150 sm:text-sm sm:leading-5"
              >
                Cancel
              </button>
            </span>
          </div>
        </div>
      </div>
    </ReactModal>
  );
};

export default MintModal;
