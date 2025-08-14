import { ServerStyles, createStylesServer } from "@mantine/next";
import Document, {
  DocumentContext,
  Html,
  Head,
  Main,
  NextScript,
} from "next/document";

// optional: you can provide your cache as a fist argument in createStylesServer function
const stylesServer = createStylesServer();

export default class _Document extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link
            rel="apple-touch-icon"
            href="/icons/maskable_icon_x512.png"
          ></link>
          <meta name="theme-color" content="#1A1B1E" />
          <script
            src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
            defer
          ></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }

  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: [
        initialProps.styles,
        <ServerStyles
          html={initialProps.html}
          server={stylesServer}
          key="styles"
        />,
      ],
    };
  }
}
