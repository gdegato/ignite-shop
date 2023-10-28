import { HomeContainer, Product } from "../styles/home"
import Image from "next/image"
import Head from 'next/head'
import { GetStaticProps } from "next"
import Link from "next/link"
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { stripe } from "../lib/stripe"
import Stripe from "stripe"

interface HomeProps {
  products: {
    id: string
    name: string
    imageUrl: string
    price: number
  }[]
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    }
  })

  return (
    <>
      <Head>
        <title>
          Home | Ignite Shop
        </title>
      </Head>
      <HomeContainer ref={sliderRef} className="keen-slider">

        {products.map(product => {
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              prefetch={false}>
              <Product
                className="keen-slider__slide">
                <Image
                  src={product.imageUrl}
                  width={520}
                  height={480}
                  alt="" />
                <footer>
                  <strong>
                    {product.name}
                  </strong>
                  <span>{product.price}</span>
                </footer>
              </Product>
            </Link>
          )
        })}
      </HomeContainer>
    </>

  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
    active: true,
  });

  const products = response.data.map(product => {
    const price = product.default_price as Stripe.Price;

    const priceInCents = price.unit_amount !== null ? price.unit_amount / 100 : 0;

    const formattedPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(priceInCents);

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: formattedPrice,
    };
  });

  return {
    props: {
      products
    },
    revalidate: 60 * 60 * 2, //a cada duas horas
  }
}