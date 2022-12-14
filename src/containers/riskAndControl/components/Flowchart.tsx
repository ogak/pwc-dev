import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Switch from "react-switch";
import { useTagsQuery } from "../../../generated/graphql";
import Header from "../../../shared/components/Header";
import {
  PreviewTag,
  PreviewTagText,
  TargetImage,
} from "../../../shared/components/ImageTagger";
import styled from "styled-components";

interface FlowchartProps {
  bpId: string;
  resourceId: string;
  img: string;
  editable: boolean;
  title?: string | null;
  className?: string;
  history?: string;
  enableShowTag?: boolean;
}

export default function Flowchart({
  bpId,
  resourceId,
  img,
  editable,
  title,
  className,
  enableShowTag,
  history = '',
}: FlowchartProps) {
  const [show, setShow] = useState(true)
  const setWindowWidth = useState(window.outerWidth)[1] //used to invalidate current layout
  const { data } = useTagsQuery({
    fetchPolicy: 'network-only',
    variables: {
      filter: {
        resource_id_eq: resourceId,
        business_process_id_eq: bpId,
      },
    },
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.outerWidth)
    }
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [setWindowWidth])

  const imageRef = useRef<HTMLImageElement>(null)
  const imageWidth = imageRef.current?.width || 0
  const imageHeight = imageRef.current?.height || 0

  const tags = resourceId ? data?.tags?.collection || [] : []
  return (
    <div className={className}>
      {enableShowTag ? (
        <div className="d-flex align-items-center justify-content-between">
          <Header>{title}</Header>
          <div className="d-flex align-items-center justify-content-start">
            <span>Show Tag</span>
            &nbsp;&nbsp;
            <Switch checked={show} width={50} height={25} onChange={setShow} />
          </div>
        </div>
      ) : null}

      <Container>
        <div className="d-flex justify-content-center align-items-center py-1">
          {/* do we need img-fluid? */}
          <TargetImage
            src={img}
            editable={editable}
            className="img-fluid"
            ref={imageRef}
          />
        </div>

        {tags.map((tag) => {
          const id = tag.risk?.id || tag.control?.id
          const type = tag.risk?.id ? 'Risk' : 'Control'
          const name = tag.risk?.name || tag.control?.description
          const background = tag.risk?.id ? '#ffb600' : 'rgb(217,57,84)'
          const fontColor = tag.risk?.id ? 'black' : 'white'

          const to = tag.risk?.id
            ? `${history.split('flowchart')[0]}risk/${tag.risk?.id}`
            : `${history.split('flowchart')[0]}control/${tag.control?.id}`

          const xCoordinates = (tag.xCoordinates || 0) * (imageWidth || 0)
          const yCoordinates = (tag.yCoordinates || 0) * (imageHeight || 0)

          return (
            <PreviewTag
              key={tag.id}
              show={show}
              x={xCoordinates}
              y={yCoordinates}
              as={Link}
              to={to}
              background={background}
            >
              <PreviewTagText
                fontColor={fontColor}
              >{`${type}: (${id}) ${name}`}</PreviewTagText>
            </PreviewTag>
          )
        })}
      </Container>
    </div>
  )
}
const Container = styled.div`
  @media (max-width: 760px) {
    max-width: unset;
  }
  max-width: 36vw;
  // max-height: 36vw;
  background: white;
  border: grey 2px solid;
  border-radius: 3px;
  position: relative;
`
