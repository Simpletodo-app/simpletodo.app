type ActiveProps = Pick<
  HTMLProps<HTMLButtonElement>,
  'aria-current' | 'className'
>

export const isActiveProps = (condition: boolean): ActiveProps =>
  condition
    ? {
        'aria-current': 'true',
        className: 'active',
      }
    : undefined
