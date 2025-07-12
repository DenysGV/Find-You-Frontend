import SuccessMain from "../components/Success/SuccessMain"
import Footer from "../components/UX/Footer"
import GradientHeader from "../components/UX/GradientHeader"
import Header from "../components/UX/Header"

const Success = () => {
   return (
      <>
         <Header />
         <GradientHeader logoPath="Успешная оплата" />
         <SuccessMain />
         <Footer />
      </>
   )
}

export default Success