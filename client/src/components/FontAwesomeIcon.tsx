import React, { FunctionComponent, SVGProps } from "react"
import { Icon } from "antd"
import { IconProps } from "antd/lib/icon"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons"

import FontAwesomeSVG from "./FontAwesomeSVG"

export interface FaIconProps extends Omit<IconProps, "type"> {
  type: IconDefinition
}

const FontAwesomeIcon: FunctionComponent<FaIconProps> = ({
  type,
  ...iconProps
}) => (
  <Icon
    component={(svgProps: SVGProps<SVGSVGElement>) => (
      <FontAwesomeSVG icon={type} {...svgProps} />
    )}
    {...iconProps}
  />
)

export default FontAwesomeIcon
