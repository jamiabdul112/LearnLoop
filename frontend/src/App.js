import { Toaster } from "react-hot-toast";
import SignUp from "./pages/signup";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { baseURL } from "./constants/baseUrl";
import SvgSpinner from "./utils/svgSpinner";
import Login from "./pages/login";
import Home from "./pages/home";
import SkillDetail from "./pages/skillDetail";
import CreateSkill from "./pages/createSkill";
import TradeDashboard from "./pages/tradeDashboard";
import ChatPage from "./pages/chatPage";
import FeedbackPage from "./pages/feedbackPage";
import Header from "./pages/header";
import EditProfile from "./pages/editProfile";


function App() {
  const location = useLocation(); // 2. Get the current path


  const {data: authUser, isLoading} = useQuery({
    queryKey : ["authUser"],
    queryFn : async()=>{
      try {
        const res = await fetch(`${baseURL}/api/auth/profile`, {
          method:"GET",
          credentials : "include",
          headers : {
            "Content-Type":"application/json"
          }
        })
        const data = await res.json()
        if(data.error){
          return null
        }
        if(!res.ok){
          throw new Error (data.error || "Something went wrong")
        }
        console.log("authUser", data)
        return data
      } catch (error) {
        throw error
      }
    },
    retry : false
  })

  const hideHeaderPaths = ["/chat", "/feedback"]; // 1. Define paths where header should be hidden
  const shouldShowHeader = authUser && !hideHeaderPaths.includes(location.pathname);
  
  if(isLoading){
    return(
      <div style={{display:"flex", justifyContent:"center", alignItems:"center", width:"100%", height:"100vh"}}>
      <SvgSpinner size={48} stroke={5} />
      </div>
    )
  }
  return (
    <div className="App">

      {shouldShowHeader && <Header authUser={authUser} />}
      <Routes>
        <Route path="/signup" element={!authUser ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/signup" />} />
        <Route path="/skills/:id" element={authUser ? <SkillDetail authUser={authUser} /> : <Navigate to="/signup" />} />
        <Route path="/skill/create" element={authUser ? <CreateSkill /> : <Navigate to="/signup" />} />
        <Route path="/trade-dashboard" element={authUser ? <TradeDashboard /> : <Navigate to="/signup" />} />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/signup" />} />
        <Route path="/feedback" element={authUser ? <FeedbackPage /> : <Navigate to="/signup" />} />
        <Route path="/edit-profile" element={authUser ? <EditProfile authUser={authUser} /> : <Navigate to="/signup" />} />

        
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
