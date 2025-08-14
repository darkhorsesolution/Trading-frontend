import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import { buildAuthOptions } from "@/pages/api/auth/[...nextauth]";

const Index = () => {
  const { data: session } = useSession({ required: true });
  const router = useRouter();

  useEffect(() => {
    if (!session) return;

    router.push("/terminal");
  }, [session]);

  return <></>;
};

export async function getServerSideProps(context) {
  const isDesktop = context.query["desktop"] === "1" ? "1" : "0";
  const session = await getServerSession(context.req, context.res, buildAuthOptions(context.req, context.res));
  if (session) {
    return {
      redirect: {
        destination: `/terminal?desktop=${isDesktop}`,
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: `/auth/signin?desktop=${isDesktop}`,
      permanent: false,
    },
  };
}

export default Index;
