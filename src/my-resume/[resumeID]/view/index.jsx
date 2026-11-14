// import Header from '@/components/ui/custom/Header'
// import { Button } from '@/components/ui/button'
// import { ResumeInfoContext } from '@/context/ResumeInfoContext'
// import ResumePreview from '@/dashboard/resume/[resumeId]/components/ResumePreview'
// import React, { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import GlobalApi from './../../../../service/GlobalApi'
// import { RWebShare } from 'react-web-share'


// function ViewResume() {

//     const [resumeInfo,setResumeInfo]=useState();
//     const {resumeId}=useParams();
//     useEffect(()=>{
//         GetResumeInfo();
//     },[])
//     const GetResumeInfo=()=>{
//         GlobalApi.GetResumeById(resumeId).then(resp=>{
//             console.log(resp.data.data);
//             setResumeInfo(resp.data.data);
//         })
//     }

//     const HandleDownload=()=>{
//         window.print();
//     }

//   return (
//     <ResumeInfoContext.Provider value={{resumeInfo,setResumeInfo}} >
//         <div id="no-print">
//         {/* <Header/> */}

//         <div className='my-10 mx-10 md:mx-20 lg:mx-36'>
//             <h2 className='text-center text-2xl font-medium'>
//                 Congrats! Your Ultimate AI generates Resume is ready ! </h2>
//                 <p className='text-center text-gray-400'>Now you are ready to download your resume and you can share unique 
//                     resume url with your friends and family </p>
//             <div className='flex justify-between px-44 my-10'>
//                 <Button onClick={HandleDownload}>Download</Button>
               
//                 <RWebShare
//         data={{
//           text: "Hello Everyone, This is my resume please open url to see it",
//           url: import.meta.env.VITE_BASE_URL+"/my-resume/"+resumeId+"/view",
//           title: resumeInfo?.firstName+" "+resumeInfo?.lastName+" resume",
//         }}
//         onClick={() => console.log("shared successfully!")}
//       > <Button>Share</Button>
//       </RWebShare>
//             </div>
//         </div>
            
//         </div>
//         <div className='my-10 mx-10 md:mx-20 lg:mx-36 print:m-0'>
//             <div id="print-area">
//                 <ResumePreview/>
//             </div>
//         </div>
//     </ResumeInfoContext.Provider>
//   )
// }

// export default ViewResume




import { Button } from '@/components/ui/button'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import ResumePreview from '@/dashboard/resume/[resumeId]/components/ResumePreview'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import GlobalApi from './../../../../service/GlobalApi'
import { RWebShare } from 'react-web-share'
import html2pdf from 'html2pdf.js'
// import { toast } from 'sonner'


const DEFAULT_THEME_COLOR = '#ff6666'

function ViewResume() {
  const [resumeInfo, setResumeInfo] = useState()
  const { resumeId } = useParams()

//   const buildPdfBlob = () => {
//   const element = document.getElementById('print-area')
//   return html2pdf()
//     .set({
//       margin: 0,
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true },
//       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
//     })
//     .from(element)
//     .outputPdf('blob')
// }

    const HandleSharePdf = async () => {
    const blob = await buildPdfBlob()
    const fileName = `${resumeInfo?.firstName || 'My'}-${resumeInfo?.lastName || 'Resume'}.pdf`
    const file = new File([blob], fileName, { type: 'application/pdf' })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
        await navigator.share({
            files: [file],
            title: `${resumeInfo?.firstName} ${resumeInfo?.lastName} resume`,
            text: 'Hello everyone, this is my resume.',
        })
        } catch (error) {
        if (error.name !== 'AbortError') console.error(error)
        }
    } else {
        // this browser can't share files, so download the PDF instead
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.click()
        URL.revokeObjectURL(url)
        toast('File sharing is not supported here. The PDF was downloaded, so attach it manually.')
    }
    }


  useEffect(() => {
    GetResumeInfo()
  }, [])

  const GetResumeInfo = () => {
    GlobalApi.GetResumeById(resumeId).then((resp) => {
      const data = resp.data.data
      console.log(data) // check that themeColor is here
      setResumeInfo({
        ...data,
        themeColor: data?.themeColor || DEFAULT_THEME_COLOR,
      })
    })
  }

  const HandleDownload = () => {
    window.print()
  }

  return (
    <ResumeInfoContext.Provider value={{ resumeInfo, setResumeInfo }}>
      <div id="no-print">
        <div className="my-10 mx-10 md:mx-20 lg:mx-36">
          <h2 className="text-center text-2xl font-medium">
            Congrats! Your Ultimate AI generates Resume is ready !
          </h2>
          <p className="text-center text-gray-400">
            Now you are ready to download your resume and you can share unique
            resume url with your friends and family
          </p>
          <div className="flex justify-between px-44 my-10">
            <Button onClick={HandleDownload}>Download</Button>

            <RWebShare
              data={{
                text: 'Hello Everyone, This is my resume please open url to see it',
                url: import.meta.env.VITE_BASE_URL + '/my-resume/' + resumeId + '/view',
                title: resumeInfo?.firstName + ' ' + resumeInfo?.lastName + ' resume',
              }}
              onClick={() => console.log('shared successfully!')}
            >
              <Button>Share</Button>
            </RWebShare>
          </div>
        </div>
      </div>

      <div className="my-10 mx-10 md:mx-20 lg:mx-36 print:m-0">
        <div id="print-area">
          <ResumePreview />
        </div>
      </div>
    </ResumeInfoContext.Provider>
  )
}

export default ViewResume