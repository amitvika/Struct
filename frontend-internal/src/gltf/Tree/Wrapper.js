
import styled from 'styled-components'
import { motion } from 'framer-motion'



const MotionWrapper = styled(motion.div)`
  padding-left: calc(${props => `20px * ${props.level}`});
  min-height: 20px;
  display: flex;
  align-items: center;
  min-width: 0;
`

const Wrapper = (props) => {
  const { level, children } = props
  return <MotionWrapper level={level}>{children}</MotionWrapper>
}

Wrapper.defaultProps = {
  level: 0
}

export default Wrapper
