const MobileIndex = () => {
  return null;
};

export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: "/app/market",
      permanent: false,
    },
  };
}

export default MobileIndex;
