import { useSelector } from "react-redux";
import UserHome from "./UserHome";
import NonUserHome from "./NonUserHome";



const Home = () => {
  const token = useSelector((state) => state.auth.token);
  return token ? <UserHome /> : <NonUserHome />;
}

export default Home;
