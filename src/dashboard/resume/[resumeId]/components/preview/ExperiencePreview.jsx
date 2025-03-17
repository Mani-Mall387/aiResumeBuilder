import React from 'react';

const ExperiencePreview = ({resumeInfo}) => {
  // Function to ensure HTML content is properly formatted
  const sanitizeHtml = (html) => {
    // If HTML is empty or undefined, return empty string
    if (!html) return '';
    
    // Make sure we have proper list styling
    // This adds specific styling to ensure bullet points are visible
    return html.replace('<ul>', '<ul style="list-style-type: disc; padding-left: 1.5em; margin-top: 0.5em;">');
  };

  return (
    <div className='my-6'>
      <h2 className='text-center font-bold text-sm mb-2' style={{
        color: resumeInfo?.themeColor
      }}>Professional Experience</h2>

      <hr style={{borderColor: resumeInfo?.themeColor}} />

      {resumeInfo?.experience.map((experience, index) => (
        <div key={index} className='my-5'>
          <h2 className='text-sm font-bold' style={{
            color: resumeInfo?.themeColor
          }}>{experience?.title}</h2>
          
          <h2 className='text-xs flex justify-between'>
            {experience?.companyName}, {experience?.city}, {experience?.state}
            <span>{experience?.startDate} To {experience?.currentlyWorking ? 'Present' : experience.endDate}</span>
          </h2>

          {/* Apply custom styling to ensure bullet points are visible */}
          <div 
            className='text-xs my-2 experience-content' 
            dangerouslySetInnerHTML={{__html: sanitizeHtml(experience?.workSummery)}}
          />
        </div>
      ))}
    </div>
  );
};

export default ExperiencePreview;