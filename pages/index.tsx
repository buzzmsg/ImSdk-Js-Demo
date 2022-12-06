import dynamic from "next/dynamic";

const Home = dynamic(() => import('../components/Home'), {ssr: false})

const Index = () => {
  return (
    <Home/>
  )
}

export default Index
