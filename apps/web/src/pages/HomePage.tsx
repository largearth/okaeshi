import { Link } from "react-router-dom";
import { Heading, Screen } from "../components/layout";
import { Icon } from "../components/ui";
import walletIllustration from "../assets/home-wallet-illustration.png";

export function HomePage() {
  return (
    <Screen active="home">
      <Heading
        eyebrow=""
        title="Home"
        right={
          <div>
            <Link
              to="/mypage"
              className="grid size-8 place-items-center text-black"
            >
              <Icon name="user" />
            </Link>
          </div>
        }
      />
      <img
        className="mx-auto block h-auto w-full max-w-none object-contain"
        src={walletIllustration}
        alt="財布とコインのイラスト"
      />
      <p className="mt-0 text-[15px] font-bold">
        立て替えた支払いを記録・確認できます
      </p>
      <Link
        className="mt-6 grid h-16 place-items-center bg-black text-[15px] font-bold text-white"
        to="/payments/new"
      >
        立て替えたお金を記録する
      </Link>
      <Link
        className="mt-3 grid h-12 place-items-center border border-black text-sm font-bold"
        to="/records"
      >
        出金記録を確認する
      </Link>
    </Screen>
  );
}
