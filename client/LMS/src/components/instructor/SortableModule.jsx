import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Collapse,
  Chip,
  Menu,
  MenuItem
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  Add as AddIcon,
  VideoLibrary,
  Assignment,
  Quiz,
  Article,
  PlayCircle,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete,
  MoreVert,
  Edit as EditIcon
} from "@mui/icons-material";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

// SortableLesson component for draggable lessons
const SortableLesson = ({ lesson, getLessonIcon, getLessonDetails, onDeleteLesson, onManageQuiz }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ListItem 
      ref={setNodeRef}
      style={style}
      sx={{ 
        pl: 0,
        backgroundColor: isDragging ? "action.hover" : "transparent",
        borderRadius: 1,
        mb: 0.5
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "grab",
          color: "text.secondary",
          mr: 1,
          "&:active": { cursor: "grabbing" },
        }}
      >
        <DragIcon fontSize="small" />
      </Box>
      <ListItemIcon sx={{ minWidth: 40 }}>
        {getLessonIcon(lesson.content_type || lesson.type)}
      </ListItemIcon>
      <ListItemText
        primary={lesson.title}
        secondary={getLessonDetails(lesson)}
      />
      {(lesson.content_type === 'quiz' || lesson.type === 'quiz') && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onManageQuiz(lesson);
          }}
          title="Manage Quiz Questions"
        >
          <Quiz color="primary" />
        </IconButton>
      )}

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteLesson(lesson.id);
        }}
      >
        <Delete />
      </IconButton>
    </ListItem>
  );
};

const SortableModule = ({ 
  module, 
  onLessonDragEnd, 
  onDeleteModule, 
  onEditModule,
  onAddLesson, 
  onDeleteLesson, 
  onAddQuiz, 
  onDeleteQuiz,
  onManageQuiz, 
  onAddAssignment, 
  onDeleteAssignment 
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Sensors for lesson drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getLessonIcon = (contentType) => {
    const iconProps = { fontSize: "small" };
    switch (contentType) {
      case 'video':
        return <VideoLibrary {...iconProps} color="primary" />;
      case 'quiz':
        return <Quiz {...iconProps} color="warning" />;
      case 'assignment':
        return <Assignment {...iconProps} color="secondary" />;
      case 'text':
        return <Article {...iconProps} color="info" />;
      default:
        return <PlayCircle {...iconProps} color="primary" />;
    }
  };

  const getLessonDetails = (lesson) => {
    if (lesson.questions) return `${lesson.questions} questions`;
    if (lesson.points) return `${lesson.points} points`;
    return "";
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 1,
        p: 2,
        backgroundColor: isDragging ? "action.hover" : "background.paper",
        transform: isDragging ? "rotate(5deg)" : "none",
        transition: "transform 0.2s ease",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          {...attributes}
          {...listeners}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "grab",
            color: "text.secondary",
            "&:active": { cursor: "grabbing" },
          }}
        >
          <DragIcon />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => setExpanded(!expanded)}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
                Module {module.orderNum}: {module.title}
              </Typography>
              <Chip 
                label={`${module.lessons.length} lessons`} 
                size="small" 
                variant="outlined"
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditModule(module.id);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteModule(module.id);
                }}
              >
                <Delete />
              </IconButton>
              <IconButton size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          <Collapse in={expanded}>
            <List dense sx={{ mt: 1 }}>
              {module.lessons && module.lessons.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onLessonDragEnd}
                >
                  <SortableContext 
                    items={module.lessons.map(lesson => lesson.id.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    {module.lessons.map((lesson) => (
                      <SortableLesson
                        key={lesson.id}
                        lesson={lesson}
                        getLessonIcon={getLessonIcon}
                        getLessonDetails={getLessonDetails}
            
                        onDeleteLesson={onDeleteLesson}
                        onManageQuiz={onManageQuiz}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </List>

            <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                size="small"
                startIcon={<PlayCircle />}
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddLesson(module.id);
                }}
              >
                Add Lesson
              </Button>
              <Button
                size="small"
                startIcon={<Assignment />}
                variant="outlined"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddAssignment(module.id);
                }}
              >
                Add Assignment
              </Button>
              <Button
                size="small"
                startIcon={<Quiz />}
                variant="outlined"
                color="warning"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddQuiz(module.id);
                }}
              >
                Add Quiz
              </Button>
            </Box>
          </Collapse>
        </Box>
      </Box>


    </Paper>
  );
};

export default SortableModule;