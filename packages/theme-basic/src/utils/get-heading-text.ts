import { Heading } from '@honeydocs/honey'

export default function getHeadingText(heading: Heading) {
  return heading.value || ''
}
