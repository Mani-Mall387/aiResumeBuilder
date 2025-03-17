import { Button } from "@/components/ui/button";
import { ResumeInfoContext } from "@/context/ResumeInfoContext";
import { Brain, LoaderCircle } from "lucide-react";
import React, { useContext, useState } from "react";
import { chatSession } from "../../../../../service/AIModel";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  Editor,
  EditorProvider,
  HtmlButton,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";
import { toast } from "sonner";

const PROMPT = 'position title: {positionTitle}, Depends on position title give me 5-7 bullet points for my experience in resume (Please do not add experience level and No JSON array), give me result in HTML tags';

const RichTextEditor = ({ onRichTextEditorChange, index, defaultValue }) => {
  const [value, setValue] = useState(defaultValue || '');
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const [loading, setLoading] = useState(false);

  const GenerateSummeryFromAI = async () => {
    setLoading(true);
    
    if (!resumeInfo.experience || !resumeInfo.experience[index] || !resumeInfo.experience[index].title) {
      toast.error('Please add Position Title');
      setLoading(false);
      return;
    }
    
    try {
      const prompt = PROMPT.replace('{positionTitle}', resumeInfo.experience[index].title);
      console.log("Sending prompt:", prompt);
      
      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();
      console.log("Raw response:", responseText);
      
      // Process the AI response
      let formattedHTML = '';
      
      try {
        // First check if the response is a JSON string
        const jsonResponse = JSON.parse(responseText);
        console.log("Parsed JSON:", jsonResponse);
        
        if (Array.isArray(jsonResponse)) {
          // Handle an array of objects
          // Check if the array contains objects with bullet_points property
          if (jsonResponse[0] && jsonResponse[0].bullet_points) {
            // Use the first object's bullet points (assuming we only want one job's bullet points)
            const bulletPoints = jsonResponse[0].bullet_points;
            formattedHTML = '<ul>' + 
              bulletPoints.map(point => `<li>${point}</li>`).join('') + 
              '</ul>';
          } else {
            // It's a simple array of strings
            formattedHTML = '<ul>' + 
              jsonResponse.map(point => `<li>${typeof point === 'string' ? point : JSON.stringify(point)}</li>`).join('') + 
              '</ul>';
          }
        } else if (jsonResponse.bullet_points && Array.isArray(jsonResponse.bullet_points)) {
          // Handle a single object with bullet_points array
          formattedHTML = '<ul>' + 
            jsonResponse.bullet_points.map(point => `<li>${point}</li>`).join('') + 
            '</ul>';
        } else {
          // Fall back to stringifying the whole object
          formattedHTML = '<ul>';
          for (const key in jsonResponse) {
            if (typeof jsonResponse[key] === 'string') {
              formattedHTML += `<li>${jsonResponse[key]}</li>`;
            } else if (Array.isArray(jsonResponse[key])) {
              jsonResponse[key].forEach(item => {
                formattedHTML += `<li>${item}</li>`;
              });
            }
          }
          formattedHTML += '</ul>';
          
          if (formattedHTML === '<ul></ul>') {
            formattedHTML = '<ul><li>' + JSON.stringify(jsonResponse) + '</li></ul>';
          }
        }
      } catch (jsonError) {
        console.log("Not valid JSON, checking for HTML content:", jsonError);
        
        // Check if response contains HTML tags
        if (responseText.includes('<ul>') || responseText.includes('<li>')) {
          formattedHTML = responseText;
        } else {
          // If no HTML tags, wrap plain text in HTML list
          formattedHTML = '<ul><li>' + responseText.replace(/\n/g, '</li><li>') + '</li></ul>';
          formattedHTML = formattedHTML.replace('<li></li>', ''); // Remove empty list items
        }
      }
      
      console.log("Formatted HTML:", formattedHTML);
      
      // Update the editor value with the HTML string
      setValue(formattedHTML);
      
      // Trigger onChange to update parent component
      const mockEvent = {
        target: {
          value: formattedHTML
        }
      };
      onRichTextEditorChange(mockEvent);
      
      setLoading(false);
    } catch (error) {
      console.error("Error processing AI response:", error);
      toast.error("Failed to generate content. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between my-2">
        <label className="text-xs">Summary</label>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex gap-2 border-primary text-primary" 
          onClick={GenerateSummeryFromAI}
        >
          {loading ? <LoaderCircle className="animate-spin" /> : <Brain className="h-4 w-4" />}
          Generate From AI
        </Button>
      </div>
      <EditorProvider>
        <Editor
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onRichTextEditorChange(e);
          }}
        >
          <Toolbar>
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />
            <Separator />
            <BtnNumberedList />
            <BtnBulletList />
            <Separator />
            <BtnLink />
          </Toolbar>
        </Editor>
      </EditorProvider>
    </div>
  );
};

export default RichTextEditor;