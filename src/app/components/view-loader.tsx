import { Flex, Text } from '@radix-ui/themes'
import React from 'react'
import { BounceLoader } from 'react-spinners'

type ViewLoaderProps = {
  message?: string
}
const ViewLoader = ({ message }: ViewLoaderProps) => {
  return (
    <Flex
      direction="column"
      className="h-screen"
      align="center"
      justify="center"
    >
      <BounceLoader color="#ccc" />
      <Text color="gray">{message}</Text>
    </Flex>
  )
}

export default ViewLoader
