import { Inter } from "next/font/google";
import "./globals.css";

//import { firebaseConfig } from "@/firebase";
//import { FirebaseAppProvider } from 'reactfire';


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    //<FirebaseAppProvider firebaseConfig={firebaseConfig}>
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
    //</FirebaseAppProvider>
  );
}
