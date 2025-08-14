import { Container } from "@mantine/core";
import Header from "./Header";

const NewsLayout = ({ children }) => {
  return (
    <>
      <Header />
      <Container
        size={"lg"}
        w={"100%"}
        sx={(theme) => ({
          paddingTop: "80px",
        })}
      >
        {children}
      </Container>
    </>
  );
};

export default NewsLayout;
