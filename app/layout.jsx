import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Five Sessions 3D Home",
  description:
    "Next.js + Three.js demo with 5 stacked 100vh sessions and scroll circle reveal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
