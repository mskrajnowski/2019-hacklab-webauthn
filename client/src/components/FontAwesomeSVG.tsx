import React, { FunctionComponent, SVGProps } from "react"

import { IconDefinition } from "@fortawesome/free-solid-svg-icons"

export interface FontAwesomeSVGProps extends SVGProps<SVGSVGElement> {
  icon: IconDefinition
}

const FontAwesomeSVG: FunctionComponent<FontAwesomeSVGProps> = ({
  icon,
  ...svgProps
}) => {
  const pathData = icon.icon[4]
  const pathDatas = typeof pathData === "string" ? [pathData] : pathData

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
      {...svgProps}
    >
      {pathDatas.map((pathData, index) => (
        <path key={index} fill="currentColor" d={pathData} />
      ))}
    </svg>
  )
}

export default FontAwesomeSVG
