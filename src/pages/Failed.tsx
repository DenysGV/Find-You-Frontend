import FailedMain from "../components/Failed/FailedMain"
import Footer from "../components/UX/Footer"
import GradientHeader from "../components/UX/GradientHeader"
import Header from "../components/UX/Header"

const Failed = () => {
   return (
      <>
         <Header />
         <GradientHeader logoPath="Неудачная оплата" />
         <FailedMain />
         <Footer />
      </>
   )
}

export default Failed