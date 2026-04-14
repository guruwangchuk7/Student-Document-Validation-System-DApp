import { ChainWithAttributes, getAlchemyHttpUrl } from "./networks";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { Pair, Route } from "@uniswap/v2-sdk";
import { Address, createPublicClient, fallback, http, parseAbi } from "viem";
import { mainnet } from "viem/chains";

const alchemyHttpUrl = getAlchemyHttpUrl(mainnet.id);
const rpcFallbacks = [
  alchemyHttpUrl ? http(alchemyHttpUrl) : null,
  http("https://cloudflare-eth.com"),
  http("https://eth.drpc.org"),
  http("https://rpc.ankr.com/eth"),
].filter(Boolean) as any[];
const publicClient = createPublicClient({
  chain: mainnet,
  transport: fallback(rpcFallbacks),
});

const ABI = parseAbi([
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
]);

export const fetchPriceFromUniswap = async (targetNetwork: ChainWithAttributes): Promise<number> => {
  if (
    targetNetwork.nativeCurrency.symbol !== "ETH" &&
    targetNetwork.nativeCurrency.symbol !== "SEP" &&
    !targetNetwork.nativeCurrencyTokenAddress
  ) {
    return 0;
  }
  try {
    const DAI = new Token(1, "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18);
    const TOKEN = new Token(
      1,
      targetNetwork.nativeCurrencyTokenAddress || "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      18,
    );
    const pairAddress = Pair.getAddress(TOKEN, DAI) as Address;

    const wagmiConfig = {
      address: pairAddress,
      abi: ABI,
    };

    const [reserves, token0Address, token1Address] = await publicClient.multicall({
      contracts: [
        { ...wagmiConfig, functionName: "getReserves" },
        { ...wagmiConfig, functionName: "token0" },
        { ...wagmiConfig, functionName: "token1" },
      ],
      allowFailure: false,
    });

    const token0 = [TOKEN, DAI].find(token => token.address === (token0Address as string)) as Token;
    const token1 = [TOKEN, DAI].find(token => token.address === (token1Address as string)) as Token;
    const pair = new Pair(
      CurrencyAmount.fromRawAmount(token0, (reserves as any)[0].toString()),
      CurrencyAmount.fromRawAmount(token1, (reserves as any)[1].toString()),
    );
    const route = new Route([pair], TOKEN, DAI);
    const price = parseFloat(route.midPrice.toSignificant(6));
    return price;
  } catch (error) {
    console.error(
      `useNativeCurrencyPrice - Error fetching ${targetNetwork.nativeCurrency.symbol} price from Uniswap: `,
      error,
    );
    return 0;
  }
};
