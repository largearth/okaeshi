import { Route, Routes } from "react-router-dom";
import { RequireSession } from "./components/RequireSession";
import { AllocationPage } from "./pages/AllocationPage";
import { GroupPage } from "./pages/GroupPage";
import { HomePage } from "./pages/HomePage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { LoginPage } from "./pages/LoginPage";
import { MypagePage } from "./pages/MypagePage";
import { PaymentPage } from "./pages/PaymentPage";
import { RecordsPage } from "./pages/RecordsPage";
import { WalletsPage } from "./pages/WalletsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<RequireSession />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/payments/new" element={<PaymentPage />} />
        <Route path="/payments/new/allocation" element={<AllocationPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/mypage" element={<MypagePage />} />
        <Route path="/wallets" element={<WalletsPage />} />
        <Route path="/group" element={<GroupPage />} />
      </Route>
    </Routes>
  );
}
