import React, { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AppContext } from '@/pages/components/AppVars'
import Editor from '@monaco-editor/react';
import { toast } from 'react-toastify';

interface TemplateProps {
    terminalCode?: string;
    setTerminalCode?: React.Dispatch<React.SetStateAction<string>>;
    myLanguage?: string;
}

const TemplateCreator = (props: TemplateProps) => {

    const context = useContext(AppContext);
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [explanation, setExplanation] = useState('');
    const [language, setLanguage] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [tagsPlaceHolder, setPlaceholder] = useState('Add tags (press Enter)');

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || (!props.terminalCode && !code)|| !explanation || (!language && !props.myLanguage)) {
            toast.warning('Please fill in all fields!');
            return;
        }

        const response = await fetch('/api/CodeTemplates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({
                title: title,
                code: props.terminalCode ? props.terminalCode : code,
                explanation: explanation,
                language: props.myLanguage ? props.myLanguage : language,
                tags,
            }),
        });

        if (!response.ok) {
            toast.error('Error creating template!');
            return;
        }

        const newTemplate = await response.json();

        console.log(newTemplate);

        if (!newTemplate || !newTemplate.id) {
            toast.error('Error creating template!');
            return;
        }

        toast.success('Template created successfully!');
        setTimeout(() => {
            router.push(`/Templates/detailedView?id=${newTemplate.id}`);
        }, 500);
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    return (
        <div className="container mx-auto p-4 mb-4">

            <div className="border rounded p-4">
                <h1 className="text-xl font-bold">Create New Code Template</h1>

                <label className="block font-medium mt-4 mb-2">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded px-2 py-1 outline-none"
                />

                <label className="block font-medium mt-4 mb-2">Explanation</label>
                <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full h-20 border rounded px-2 py-1 outline-none">
                </textarea>

                <label className="block font-medium mt-4 mb-2">Language</label>
                {props.myLanguage ? <>
                {props.myLanguage}
                <> (Select below)</>
                </>
                : 
                <select
                    value={props.myLanguage ? props.myLanguage :language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full border rounded px-2 py-1 outline-none">
                    <option value="">Select language</option>
                    <option value="c">C</option>
                    <option value="cpp">Cpp</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="csharp">Csharp</option>
                    <option value="rust">Rust</option>
                    <option value="swift">Swift</option>
                    <option value="go">Go</option>
                    <option value="r">R</option>
                    <option value="php">PHP</option>
                </select>
}
                <label className="block font-medium mt-4 mb-2">Code</label>
                <Editor
                    height="25vh"
                    language={props.myLanguage ? props.myLanguage : language}
                    value={props.terminalCode ? props.terminalCode : code ?? ''}
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollbar: { vertical: 'auto', horizontal: 'auto' },
                        fontSize: 14,
                    }}
                    onChange={(value) => {setCode(value || ''); props.setTerminalCode ? props.setTerminalCode(value || '') : null}}
                    theme={context?.theme === 'light' ? 'vs-light' : 'vs-dark'}
                    className="border rounded outline-none"
                />

                <label className="block font-medium mt-4 mb-2">Tags</label>

                 <div className="flex items-center w-full rounded h-10" id="tagSelect">
                    {tags.map((tag) => (
                    <span className="flex items-center px-2 py-1 rounded mr-1" id="tag" key={tag}>
                        {tag}
                        <button
                            onClick={() => {
                            handleRemoveTag(tag);
                            if (tags.length === 1) {
                                setPlaceholder('Add tags (press Enter)');
                            }
                            }}
                            className="ml-1 font-bold bg-transparent text-gray-500">
                            &times;
                        </button>
                    </span>
                    ))}

                    <input
                        type="text"
                        placeholder={tagsPlaceHolder}
                        value={tagInput}
                        onChange={(e) => { setTagInput(e.target.value); setPlaceholder(''); }}
                        onKeyDown={handleAddTag}
                        className="border-none outline-none flex-grow h-full p-2"
                    />
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleCreateTemplate}
                        className="bg-transparent text-gray-400 border-2 border-gray-400 font-bold py-2 px-4 rounded">
                        Create Template
                    </button>
                </div>
            </div>

        </div>

    );

};

export default TemplateCreator;