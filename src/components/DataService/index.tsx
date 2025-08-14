import dynamic from "next/dynamic";

const DataService = dynamic(
  () => import("@/components/DataService/DataServiceAgent"),
  {
    ssr: false,
  }
);

export default DataService;
