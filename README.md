# 🌟 Stellar Journey: White Belt - Transaction History Viewer

This project is a high-quality, professional **Stellar Payment Dashboard** built for the **RiseIn Stellar Journey Mastery - White Belt** challenge. It allows users to connect their wallets on the **Stellar Testnet**, manage contacts, send payments, and visualize their balance history with advanced analytics.

---

## 🚀 Live Demo & Screenshots

### 🔑 Wallet Connected
*Insert your screenshot here showing the connected status and truncated public key*

### 💰 Balance Displayed
*Insert your screenshot here showing the XLM balance clearly in the dashboard*

### ✅ Successful Transaction
*Insert your screenshot here showing the payment success message with the transaction hash*

---

## ✨ Features

### 🛠️ Core Requirements (White Belt)
- **Multi-Wallet Integration**: Seamless connection with **Freighter**, xBull, and more using the Stellar Wallets Kit.
- **Real-Time Balances**: Fetches and displays the current XLM balance directly from the Stellar Testnet.
- **Secure Payments**: Fully functional payment form with amount validation and memo support.
- **Transaction Feedback**: Immediate success/failure alerts with clickable transaction hashes and explorer links.

### 🎨 Bonus Features (The "Pro" Experience)
- **Balance History Analytics**: A custom algorithm that reconstructs your historical balance by "rewinding" past transactions.
- **Private Address Book**: Save and name your frequent contacts using `localStorage` persistence.
- **Dark/Light Mode**: A premium, system-aware design system using HSL color tokens.
- **Forensic Filtering**: Optimized search bar to find transactions by address or hash using `useMemo` for speed.
- **SSR-Safe Architecture**: Implemented with Next.js dynamic imports to ensure reliable performance.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Blockchain**: [Stellar SDK v12.3.0](https://developers.stellar.org/)
- **Wallet Kit**: [@creit.tech/stellar-wallets-kit](https://stellarwalletskit.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)

---

## 📦 Setup & Installation

Follow these steps to run the project locally:

1. **Clone or open the project**:
   ```bash
   cd stellar-frontend-challenge
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Access the dashboard**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

- `/app`: Next.js App Router and global styles.
- `/components`: Custom-built UI components (Balance, Payment, History, Chart, Address Book).
- `/lib/stellar-helper.ts`: Core blockchain logic wrapper (Testnet configuration).
- `/public`: Static assets.

---

## 🛡️ Important Safety Note
This application runs strictly on the **Stellar Testnet**. Do **NOT** use real XLM or Mainnet private keys. Use the [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=test) to fund your testnet account.

---

Developed with ❤️ for the **RiseIn Stellar Journey Mastery**.
