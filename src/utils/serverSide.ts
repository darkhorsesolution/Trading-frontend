import { IAsset } from "@/interfaces/IAsset";
import { GetSymbols } from "@/services/TradeService";

export async function defaultGetServerSideProps(context) {
  let assets: IAsset[] = global._assets || undefined;
  if (!assets) {
    try {
      let code: number;
      console.log("downloading assets");
      [code, assets] = await GetSymbols();
      global._assets = assets;
    } catch (e) {
      return {
        redirect: {
          destination: "/auth/signin?error=maintenance",
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      assets,
    },
  };
}
