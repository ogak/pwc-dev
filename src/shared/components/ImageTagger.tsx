import uniqueId from "lodash/uniqueId";
import React, { useEffect, useState, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
// import { GroupType } from "react-select";
import Async from "react-select/async";
import Switch from "react-switch";
import styled, { keyframes } from "styled-components";
import {
  Control,
  Risk,
  RisksOrControlsDocument,
  RisksOrControlsQuery,
  Tag,
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import { Suggestion, toLabelValue } from "../../shared/formatter";
import useLazyQueryReturnPromise from "../../shared/hooks/useLazyQueryReturnPromise";
import useKeyDetection from "../hooks/useKeyDetection";
import { Row, Col } from "reactstrap";

interface ImageTaggerProps {
  bpId: string;
  src: string;
  editable: boolean;
  className?: string;
  onTagsChanged?: (tags: Omit<Tag, "createdAt" | "updatedAt">[]) => void;
  defaultTags?: Omit<Tag, "createdAt" | "updatedAt">[];
}

interface FlowchartSuggestion {
  label: string;
  value: FlowchartSuggestionValue;
}

interface FlowchartSuggestionValue {
  riskId?: string;
  controlId?: string;
}

interface CurrentTag {
  id: string;
  active: boolean;
  x: number;
  y: number;
  risk?: Pick<Risk, "id" | "name"> | null;
  control?: Pick<Control, "id" | "description"> | null;
}

export default function ImageTagger({
  bpId,
  src,
  editable,
  className,
  onTagsChanged,
  defaultTags,
}: ImageTaggerProps) {
  const [show, setShow] = useState(true);
  const [tags, setTags] = useState(defaultTags || []);
  const init: CurrentTag = { id: "", active: false, x: 0, y: 0 };
  const [currentTag, setCurrentTag] = useState(init);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageWidth = imageRef.current?.width || 0;
  const imageHeight = imageRef.current?.height || 0;
  const setWindowWidth = useState(window.outerWidth)[1]; //used to invalidate current layout

  const taggerX = getTaggerX();
  const taggerY = currentTag.y * imageHeight;

  function getTaggerX() {
    const xCoor = currentTag.x * imageWidth;
    const taggerWidth = 300;
    const taggerRight = xCoor + taggerWidth;

    if (taggerRight > imageWidth) return xCoor - (taggerRight - imageWidth);

    return xCoor;
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.outerWidth);
    }
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [setWindowWidth]);

  const restrictedControlIds = tags
    .map((a) => a.control?.id)
    .filter(Boolean) as string[];
  const restrictedRiskIds = tags
    .map((a) => a.risk?.id)
    .filter(Boolean) as string[];

  useEffect(() => {
    onTagsChanged?.(tags);
  }, [tags, onTagsChanged]);

  useKeyDetection("Escape", () => {
    setCurrentTag((currentTag) => (currentTag.active ? init : currentTag));
  });

  const handleLoadOptions = useLoadRiskAndControls({
    bpId,
    restrictedControlIds,
    restrictedRiskIds,
  });

  function handleCreate(x: number, y: number) {
    if (currentTag.risk?.id || currentTag.control?.id) {
      setTags((tags) =>
        tags.concat({
          id: uniqueId(),
          xCoordinates: x,
          yCoordinates: y,
          risk: currentTag.risk,
          control: currentTag.control,
        })
      );
      setCurrentTag(init);
    }
  }

  function handleUpdate(id: string) {
    setTags((tags) =>
      tags.map((tag) =>
        tag.id === id
          ? { ...tag, risk: currentTag.risk, control: currentTag.control }
          : tag
      )
    );
    setCurrentTag(init);
  }

  function handleDelete(id: string) {
    setTags((tags) => tags.filter((tag) => tag.id !== id));
    setCurrentTag(init);
  }

  function handleClick(e: React.MouseEvent<HTMLImageElement, MouseEvent>) {
    e.persist();
    e.stopPropagation();
    if (currentTag.active) {
      setCurrentTag(init);
    } else {
      const x = e.nativeEvent.offsetX / (e.target as any).width
      const y = e.nativeEvent.offsetY / (e.target as any).height

      setCurrentTag({
        id: "",
        active: true,
        x,
        y
      });
    }
  }

  function handleClose() {
    setCurrentTag(init);
  }

  function handlePreviewTagClick(tag: Omit<Tag, "createdAt" | "updatedAt">) {
    return function(e: React.MouseEvent<HTMLImageElement, MouseEvent>) {
      e.stopPropagation();
      setCurrentTag({
        id: tag.id,
        active: true,
        x: tag.xCoordinates || 0,
        y: tag.yCoordinates || 0,
        risk: tag.risk,
        control: tag.control,
      });
    };
  }

  function handleSelectChange(e: any) {
    if (e) {
      const { label, value } = e;
      setCurrentTag((prevTag) => ({
        ...prevTag,
        ...(value.riskId && { risk: { id: value.riskId, name: label } }),
        ...(value.controlId && {
          control: { id: value.controlId, description: label },
        }),
      }));
    }
  }

  return (
    <div className={className}>
      <CoolDiv>
        <div className="d-flex align-items-center justify-content-start">
          <span>Show Tag</span>
          &nbsp; &nbsp;
          <Switch checked={show} width={50} height={25} onChange={setShow} />
        </div>
      </CoolDiv>
      <Row>
        <Col>
          <ImageTaggerWrapper onClick={editable ? handleClick : undefined}>
            <TargetImage src={src} editable={editable} className="img-fluid" ref={imageRef} />
            {tags.map((tag) => {
              const id = tag.risk?.id || tag.control?.id;
              const type = tag.risk?.id ? "Risk" : "Control";
              const name = tag.risk?.name || tag.control?.description;
              const background = tag.risk?.id ? "#ffb600" : "rgb(217,57,84)";
              const fontColor = tag.risk?.id ? "black" : "white";

              const to = tag.risk?.id
                ? `/risk/${tag.risk?.id}`
                : `/control/${tag.control?.id}`;

              const xCoordinates = (tag.xCoordinates || 0) * (imageWidth || 0);
              const yCoordinates = (tag.yCoordinates || 0) * (imageHeight || 0);

              if (editable) {
                return (
                  <PreviewTag
                    key={tag.id}
                    show={show}
                    onClick={handlePreviewTagClick(tag)}
                    x={xCoordinates || 0}
                    y={yCoordinates || 0}
                    background={background}
                  >
                    <PreviewTagText
                      fontColor={fontColor}
                    >{`${type}: (${id}) ${name}`}</PreviewTagText>
                  </PreviewTag>
                );
              }
              return (
                <PreviewTag
                  key={tag.id}
                  show={show}
                  x={xCoordinates || 0}
                  y={yCoordinates || 0}
                  as={Link}
                  to={to}
                  background={background}
                >
                  <PreviewTagText
                    fontColor={fontColor}
                  >{`${type}: (${id}) ${name}`}</PreviewTagText>
                </PreviewTag>
              );
            })}
            {currentTag.active && (
              <TaggerBox
                onClick={(e) => e.stopPropagation()}
                x={taggerX}
                y={taggerY}
              >
                <TaggerBoxInner>
                  <TaggerBoxCloseButton
                    onClick={handleClose}
                    size={13}
                    color="#3a3838"
                  />
                  <Async
                    loadOptions={handleLoadOptions}
                    defaultOptions
                    onFocus={(e) => e.stopPropagation()}
                    placeholder="Select..."
                    onChange={handleSelectChange}
                    value={
                      currentTag.risk
                        ? {
                            label: currentTag.risk?.name,
                            value: { riskId: currentTag.risk?.id },
                          }
                        : currentTag.control
                        ? {
                            label: currentTag.control?.description,
                            value: { controlId: currentTag.control?.id },
                          }
                        : undefined
                    }
                  />
                  <div className="d-flex justify-content-end">
                    {currentTag.id ? (
                      <Button
                        onClick={() => handleDelete(currentTag.id)}
                        size="sm"
                        className="mr-1 reset flex-fill"
                      >
                        Delete
                      </Button>
                    ) : <div className="flex-fill mr-5" />}
                    <Button
                      onClick={() =>
                        currentTag.id
                          ? handleUpdate(currentTag.id)
                          : handleCreate(currentTag.x, currentTag.y)
                      }
                      size="sm"
                      className="base flex-fill"
                    >
                      Save
                    </Button>
                  </div>
                </TaggerBoxInner>
              </TaggerBox>
            )}
          </ImageTaggerWrapper>
        </Col>
      </Row>
    </div>
  );
}
const CoolDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;
export const ImageTaggerWrapper = styled.div`
  position: relative;
`;

export const TargetImage = styled.img<{ editable: boolean }>`
  cursor: ${(p) => (p.editable ? "crosshair" : "")};
  width: 100%;
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;
interface PreviewTagProps {
  x: number;
  y: number;
  show: boolean | number;
  background?: string;
}
export const PreviewTag = styled.div<PreviewTagProps>`
  position: absolute;
  top: ${(p) => p.y + 10}px;
  left: ${(p) => p.x - 50}px;
  background-color: ${(p) => p.background || "rgba(0, 0, 0, 0.85)"};
  width: 100px;
  border-radius: 3px;
  text-align: center;
  vertical-align: middle;
  z-index: 10;
  cursor: pointer;
  padding: 5px 8px;
  /* in and out transition */
  visibility: ${(props) => (!props.show ? "hidden" : "visible")};
  transition: visibility 1s linear;
  animation: ${(props) => (!props.show ? fadeOut : fadeIn)} 1s linear;
  /* hover transition */
  transition: 1s cubic-bezier(0.075, 0.82, 0.165, 1);
  white-space: nowrap;
  &:hover {
    white-space: unset;
    z-index: 100;
    background-color: ${(p) => p.background || "black"};
  }
  /* remove default Link style */
  text-decoration: none;
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
  /* create the tip */
  &::before {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid ${(p) => p.background || "rgba(0, 0, 0, 0.85)"};
    position: absolute;
    top: -8px;
    left: 40px;
  }
`;

export const PreviewTagText = styled.div<{ fontColor?: string }>`
  color: ${(p) => p.fontColor};
  font-size: smaller;
  font-weight: bold;
  text-overflow: ellipsis;
  overflow-x: hidden;
  ${PreviewTag}:hover & {
    text-overflow: unset;
    overflow-x: unset;
  }
`;

const TaggerBox = styled.div<{ x: number; y: number }>`
  position: absolute;
  top: ${(p) => p.y + 10}px;
  left: ${p => p.x}px;
  background-color: rgba(233, 236, 239, 1);
  width: 300px;
  height: 120px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  z-index: 1000000;
  &::before {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid rgba(0, 0, 0, 0.85);
    position: absolute;
    top: -8px;
    left: 40px;
  }
`;

const TaggerBoxInner = styled.div`
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: black;
  height: 100%;
`;

const TaggerBoxCloseButton = styled(FaTimes)`
  cursor: pointer;
  position: absolute;
  top: 4px;
  right: 4px;
`;

function useLoadRiskAndControls({
  bpId,
  restrictedRiskIds,
  restrictedControlIds,
}: {
  bpId: string;
  restrictedRiskIds: string[];
  restrictedControlIds: string[];
}) {
  const query = useLazyQueryReturnPromise<RisksOrControlsQuery>(
    RisksOrControlsDocument
  );
  // Ini adalah high order function. Digunakan agar dapat mengubah nilai 'key' tanpa menulis function 2 kali.
  // Higher Order Function adalah fungsi yang return fungsi.
  const constructValue = (key: string) => (f: Suggestion) => ({
    label: f.label,
    value: { [key]: f.value },
  });

  async function getSuggestions(name: string = "") {
    try {
      const { data } = await query({
        filter: {
          name_cont: name,
          description_cont: name,
          business_processes_id_eq: bpId,
        },
      });

      const options = [
        {
          label: "Risks",
          options:
            data.risks?.collection
              .filter(({ id }) => {
                return !restrictedRiskIds.includes(id);
              })
              .map(toLabelValue)
              .map(constructValue("riskId")) || [],
        },
        {
          label: "Controls",
          options: data.risks?.collection
            .map((a) =>
              a.controls
                ? a.controls
                    .filter(({ id }) => !restrictedControlIds.includes(id))
                    .map(({ id, description }) => ({ id, name: description }))
                    .map(toLabelValue)
                    .map(constructValue("controlId")) || []
                : null
            )
            .flat(),
        },
      ];
      return options;
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}
