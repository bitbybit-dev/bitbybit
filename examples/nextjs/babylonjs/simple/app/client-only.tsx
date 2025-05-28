'use client'
import dynamic from "next/dynamic"
import { FunctionComponent, PropsWithChildren } from "react"

const ClientOnly: FunctionComponent<PropsWithChildren> = ({ children }) => children

export default dynamic(() => Promise.resolve(ClientOnly), {
    ssr: false,
})