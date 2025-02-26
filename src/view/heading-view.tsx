import {
  Accordion, AccordionDetails, AccordionSummary, Backdrop,
  Container, Divider, Fab, List, ListItem, Slider, Stack,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Heading } from "../article/heading"
import { HeadingModal } from "./heading-modal";

type HeadingViewProps = {
  heading: Heading;
  setHeadingModal: (heading: Heading) => void;
  selectedHeading: Heading | undefined;
  setSelectedHeading: (heading: Heading | undefined) => void;
  optSubheadings: string[];
  addSubheading: (subheading: string) => void;
}

export const HeadingView = ({
  heading,
  setHeadingModal,
  selectedHeading,
  setSelectedHeading,
  optSubheadings,
  addSubheading
}: HeadingViewProps) => {

  return (
    <Accordion
      className="p-heading-form"
      defaultExpanded
    >
      <AccordionSummary>
        <Typography>{heading.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Container>
          <List>
            {heading.subs.map((v, i) => (
              <div key={i}>
                <ListItem className="sub-item" sx={{ margin: 0 }}>
                  <Typography>{v}</Typography>
                </ListItem>
                {i < heading.subs.length - 1 && <Divider />}
              </div>
            ))}
          </List>
          <Fab
            variant="extended"
            size="small"
            color="primary"
            className="add-button"
            onClick={() => setHeadingModal(heading)}
          >
            <AddIcon />
            追加
          </Fab>
          <Backdrop
            open={selectedHeading != undefined}
            onClick={() => setSelectedHeading(undefined)}
            sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}
          >
            <HeadingModal
              optSubheadings={optSubheadings}
              addSubheading={addSubheading}
            />
          </Backdrop>
        </Container>
        <Stack>
          <Typography>文章の長さ</Typography>
          <Slider
            defaultValue={500}
            valueLabelDisplay="auto"
            onChange={(_, v) => heading.length = (v as number)}
            step={100}
            min={300}
            max={1500}
            marks
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}