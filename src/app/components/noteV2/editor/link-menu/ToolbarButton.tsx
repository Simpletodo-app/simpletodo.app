import React from 'react'

import { IconButton, Tooltip } from '@radix-ui/themes'

interface ToolbarButtonProps {
  Icon: React.ComponentType
  tooltip?: string
  onClick?: () => void
}

export const ToolbarButton = (props: ToolbarButtonProps) => {
  const { Icon, tooltip, ...rest } = props

  return (
    <Tooltip content={tooltip}>
      <IconButton
        {...rest}
        size="1"
        variant="ghost"
        className="link-toolbar-button"
      >
        <Icon />
      </IconButton>
    </Tooltip>
  )
}
