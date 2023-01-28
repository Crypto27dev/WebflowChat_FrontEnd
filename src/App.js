import Signin from "./Pages/Signin.js"
import Home from "./Pages/Home.js"
import { useContext } from "react"
import { AuthContext } from "./Context/AuthContext.js"

function App() {
  const { isLoading } = useContext(AuthContext);
  return (
    <div className="App">
      {isLoading ? (
        <Signin></Signin>
      ) : (
        <Home></Home>
      )}
    </div>
  );
}

export default App;
