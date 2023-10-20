export default defineAppConfig({
  ui: {
    primary: 'orange',
    gray: 'neutral',
    accordion: {
      item: {
        padding: 'pt-1.5 px-4 pb-3'
      }
    },
    button: {
      variant: {
        ghost: 'hover:bg-transparent dark:hover:bg-transparent'
      }
    },
    card: {
      background: 'bg-transparent dark:bg-transparent',
      body: {
        base: 'h-full flex-grow'
      },
      ring: '',
      shadow: ''
    }
  }
})
