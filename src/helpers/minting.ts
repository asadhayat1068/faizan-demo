import { BigNumber } from "ethers";
import { Address, Client } from "viem";
import { ERC20ABI } from "../providers/Contract/abi";
import { simulateContract } from "viem/actions";

export const simulateApproveTokens = async (
  token: Address,
  spender: Address,
  amount: BigNumber,
  client: Client
) => {
  console.log({
    token,
    spender,
    amount,
  });
  console.log("Account: ", client.account);
  const result = simulateContract(client, {
    address: token,
    abi: ERC20ABI,
    functionName: "approve",
    args: [spender, amount.toString()],
    account: client.account,
  });
  return result;
};

export const mintToken = async (
  token: string,
  walletAddress: string,
  paymentToken: string,
  productSKU: string
) => {};
