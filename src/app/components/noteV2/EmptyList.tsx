import { ArchiveIcon, Pencil2Icon } from '@radix-ui/react-icons'
import { Code, Flex, Heading, Text } from '@radix-ui/themes'
import React from 'react'

const EmptyList = () => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className="h-screen note-container"
      gap="3"
    >
      <ArchiveIcon color="gray" className="h-20 w-20 " />
      <Heading color="gray">No Todo lists</Heading>
      <Text
        color="gray"
        className="flex justify-center items-center gap-1 flex-wrap"
      >
        Try adding a new list by clicking the top left{' '}
        <Pencil2Icon width="18" height="18" /> button or{' '}
        <Code className="whitespace-nowrap">CMD + N</Code>{' '}
        <Code className="whitespace-nowrap">CTRL + N</Code>
      </Text>
    </Flex>
  )
}

export default EmptyList
