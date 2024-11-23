import { IconButtonProps } from '@radix-ui/themes/dist/cjs/components/icon-button'

type ActiveProps = Pick<
  HTMLProps<HTMLButtonElement>,
  'aria-current' | 'className'
> &
  Pick<IconButtonProps, 'color'>

export const isActiveProps = (condition: boolean): ActiveProps =>
  condition
    ? {
        'aria-current': 'true',
        className: 'active',
        color: 'indigo',
      }
    : undefined
