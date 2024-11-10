import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Editor from '@monaco-editor/react';

interface CodeTemplate {
  id: number;
  title: string;
  code: string;
  language: string;
  tags: { name: string }[],
  createdBy: { userName: string };
}

const codeTemplatesList = () => {

  const router = useRouter();
  const pageSize = 5;
  
  const [templates, setTemplates] = useState<CodeTemplate[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchUser, setSearchUser] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLanguage, setSearchLanguage] = useState('');
  const [searchExplanation, setSearchExplanation] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagsPlaceHolder, setPlaceholder] = useState('Add tags (press Enter)');

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchTemplates();
    }, 500);
  
    return () => {
      clearTimeout(handler);
    };
  }, [searchUser, searchTitle, searchLanguage, searchExplanation, searchTags]);
  
  useEffect(() => {
    fetchTemplates();
  }, [currentPage]);

  const fetchTemplates = async () => {
    try {
      const query = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(pageSize),
        createdUser: searchUser,
        title: searchTitle,
        language: searchLanguage,
        explanation: searchExplanation,
        tags: searchTags.join(','),
      }).toString();

      console.log(query);

      const response = await fetch(`/api/CodeTemplates?${query}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error fetching templates');
        setTemplates([]);
        setTotalPages(1);
        return;
      }

      const data = await response.json();

      console.log(data);

      setTemplates(data.codeTemplates);
      setTotalPages(data.totalPages);
    } 
    catch (error) {
      console.error('Error fetching templates');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!searchTags.includes(tagInput.trim())) {
        setSearchTags([...searchTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSearchTags(searchTags.filter((t) => t !== tag));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Code Templates</h1>

      <div className="mb-4 flex flex-wrap gap-2 items-center">

        <select 
          value={searchLanguage} 
          onChange={(e) => setSearchLanguage(e.target.value)} 
          className="border p-2 rounded w-1/6">
            <option value="">Select language</option>
            <option value="c">C</option>
            <option value="c++">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="c#">C#</option>
            <option value="rust">Rust</option>
            <option value="swift">Swift</option>
            <option value="go">Go</option>
            <option value="r">R</option>
        </select>

        <input 
          type="text"   
          placeholder="Search by title" 
          value={searchTitle} 
          onChange={(e) => setSearchTitle(e.target.value)} 
          className="border p-2 rounded w-1/6" 
        />

        <input 
          type="text" 
          placeholder="Search by explanation" 
          value={searchExplanation} 
          onChange={(e) => setSearchExplanation(e.target.value)} 
          className="border p-2 rounded w-1/6" 
        />

        <input 
          type="text" 
          placeholder="Search by username" 
          value={searchUser} 
          onChange={(e) => setSearchUser(e.target.value)} 
          className="border p-2 rounded w-1/6"
        />

        <div className="flex items-center border p-2 w-1/4 rounded h-10">
          {searchTags.map((tag) => (
            <span key={tag} className="flex items-center bg-blue-200 text-blue-800 px-2 py-1 rounded mr-1">
              {tag}
              <button
                onClick={() => {
                  handleRemoveTag(tag);
                  if (searchTags.length === 1) {
                    setPlaceholder('Add tags (press Enter)');
                  }
                }}
                className="ml-1 font-bold">
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
            className="border-none outline-none flex-grow h-full"
          />
        </div>

        <button
          onClick={() => {
            setSearchUser('');
            setSearchTitle('');
            setSearchLanguage('');
            setSearchExplanation('');
            setSearchTags([]);
            setTagInput('');
            setPlaceholder('Add tags (press Enter)');
          }}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
          Clear
        </button>

      </div>

      <div className="space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="p-4 border rounded shadow">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{template.title}</h2>
              
              <div className="text-gray-500">
                <span className="font-semibold">Created by: {template.createdBy.userName}</span>
              </div>
            </div>
            
            <p className="text-gray-500">Language: {template.language}</p>
            <div className="flex space-x-2 mt-2">
              {template.tags.map((tag) => (
                <span key={tag.name} className="px-2 py-1 bg-blue-200 rounded">
                  {tag.name}
                </span>
              ))}
            </div>

            <button
              onClick={() => router.push(`Templates/detailedView?id=${template.id}`)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Read More
            </button>
          
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          disabled={currentPage === 1}>
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

    </div>
  );
}

export default codeTemplatesList;