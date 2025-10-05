import "@rainbow-me/rainbowkit/styles.css";
import { Toaster } from "react-hot-toast";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Scaffold-ETH 2 App",
  description: "Built with 🏗 Scaffold-ETH 2",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={``}>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                // default options for all toasts
                duration: 4000,
                style: {
                  borderRadius: "8px",
                  padding: "12px 14px",
                  fontSize: "14px",
                },
              }}
            />
          </ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
