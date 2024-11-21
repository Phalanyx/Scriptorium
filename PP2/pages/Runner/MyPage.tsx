import React, { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import Terminal from '@/pages/components/Terminal'
import { AppContext } from '@/pages/components/AppVars'
import { toast } from 'react-toastify'
import TemplateCreator from '../Templates/createTemplate'
const languages = ['python', 'javascript', 'java', 'c', 'cpp', 'ruby', 'rust', 'swift', 'r', 'php', 'go'];

interface RequestBody {
  language: string;
  code: string;
  input: string;
  className: string;
}

interface MyPageProps {
  setError: React.Dispatch<React.SetStateAction<number>>;
}

const MyPage = (props: MyPageProps) => {

  const context = useContext(AppContext);
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState('# Type your code here')
  const [output , setOutput] = useState('Output')
  const [error, setError] = useState('')
  const [input, setInput] = useState('')
  const [title, setTitle] = useState('Code Runner')
  const [className, setClassName] = useState('Main')
  const [hideCreate, setHideCreate] = useState(false)
  let tags: Array<Object> = []
  let description = 'description'
  const router = useRouter()
  const { id } = router.query


  const saveCode = async (id: string, code: string, language: string, title: string, tags: Array<Object>, desc: string) => {
    


    const response = await fetch(`/api/CodeTemplates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'authorization': 'Bearer '+ localStorage.getItem('accessToken')
      },
      body: JSON.stringify({ code, language, title, tags, desc })
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error('Error saving code');
      return;
    }

    toast.success('Code saved successfully!');

  }

  const deleteCode = async (id: string) => {

    const response = await fetch(`/api/CodeTemplates/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'authorization': 'Bearer ' + localStorage.getItem('accessToken')
      }
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error('Error deleting code');
      return;
    }

    toast.success('Code deleted successfully!');

    setTimeout(() => {
      router.push('/Runner?id=0');
    }, 500);

  }

  const forkCode = async (id: string) => {

    const response = await fetch(`/api/CodeTemplates/Fork`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': 'Bearer ' + localStorage.getItem('accessToken')
      },
      body: JSON.stringify({ id })
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error('Error forking code');
      return;
    }

    console.log(data);
    toast.success('Code forked successfully!');

    setTimeout(() => {
      router.push(`/Runner?id=${data.id}`);
    }, 500);
  }

  const fetchCode = async (id: string) => {
    const response = await fetch(`/api/CodeTemplates?id=${id}`);
    const data = await response.json();    
    console.log(data);
    return data;
  };

  const runCode = async () => {
    setOutput('');
    setError('');
    props.setError(3);
    const req: RequestBody = { language: language ?? 'python', code: code ?? '#', input: input ?? '', className: className ?? 'Main' };

    const response = await fetch('/api/CodeRunner', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req)
    });
    const data = await response.json();
    
    data.output !== '' ? (setOutput(data.output), props.setError(1)) : setOutput('');
    data.error !== '' ? (setError(data.error), props.setError(0)) : setError('');
  }

  useEffect(() => {
    if (id) {
      fetchCode(id as string).then((data) => {
        setCode(data.code ?? '# Type your code here')
        setLanguage(data.language ?? 'python')
        tags = data.tags ?? []
        description = data.description ?? 'description'
        setTitle(data.title ?? 'Code Runner')
       })
    }
  }, [id])

  return (
    <div>
      {hideCreate ? <TemplateCreator terminalCode={code} setTerminalCode={setCode} myLanguage={language}/>: <> </>}
      <div className="p-4">
        <div className="flex items-center justify-between ">
            <div className="text-xl font-semibold ">{title}</div>

            { context?.userID ?
            <div className="flex space-x-4">
                <button className="text-xl rounded px-4" onClick={() => {
                  forkCode(id as string)
                }}>
                  <i className="fas fa-code-branch"></i> 
                </button>

                <button className="text-xl rounded px-4" onClick={() =>{
                  deleteCode(id as string)
                }}>
                  <i className="fas fa-trash-alt"></i> 
                </button>

                <button className="text-xl rounded px-4" onClick={() => {
                  id ? saveCode(id as string, code, language, title, tags, description) : setHideCreate(!hideCreate)
                }}>
                  <i className="fas fa-save"></i> 
                </button>
            </div> 
            : <> </>
            }
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Set file name (optional)"
                className="p-2 rounded-lg"
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="p-2 rounded-lg">
                {languages.map((lang) => (
                  <option key={lang} value={lang} className="">
                    {lang}
                  </option>
                ))}
              </select>

              <button className=" font-bold py-2 px-4 rounded"
              onClick={() => {
                console.log(code)
                runCode()

              }
              }>
                Run code
              </button>
            </div>
        </div>
  
        <div className='flex flex-row mt-4'>
            <Terminal 
            lang={language} code={code} setCode={setCode}
            />

            <div className="flex flex-col w-screen px-4">
                <textarea
                  className="mb-4 p-2 border rounded-lg w-full h-1/2 outline-none"
                  placeholder="Type your input here separated by newlines..."
                  onChange={(e) => setInput(e.target.value)}
                />

                <div className="p-2 border rounded-lg h-1/2 overflow-auto ">
                  {output.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                    {error.split('\n').map((line, index) => (
                    <div key={index} style={{ color: 'red' }}>{line}</div>
                    ))}
                </div>
            </div>
          </div>
        </div>
    </div>
  )

}

export default MyPage