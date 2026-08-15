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
      <section className="mt-0">
        <p className="mb-1.5 text-[13px] font-bold">請求総額</p>
        <strong className="block text-[49px] leading-none font-extrabold tracking-[-0.06em]">
          ¥2,000
        </strong>
        <span className="mt-3 inline-block rounded-full border border-black px-2.5 py-1 text-xs font-bold">
          3件の請求が未精算です
        </span>
      </section>
      <Link
        className="mt-6 grid h-16 place-items-center bg-black text-[15px] font-bold text-white"
        to="/payments/new"
      >
        立て替えたお金を記録する
      </Link>
    </Screen>
  );
}
