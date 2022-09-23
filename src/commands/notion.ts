// Copyright (c) codewithsathya. All rights reserved.
// Licensed under the MIT license.

import axios from 'axios'

async function updatePage(secret, pageId) {
  let date = new Date(Date.now()).toISOString().split("T")[0];
  const options = {
    method: "PATCH",
    url: "https://api.notion.com/v1/pages/" + pageId,
    headers: {
      Accept: "application/json",
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      Authorization:
        `Bearer ${secret}`,
    },
    data: {
      properties: {
        Status: {
          select: {
            name: "Done",
          },
        },
        "Last Submitted": {
          date: {
            start: date
          }
        }
      },
    },
  };
  let { data } = await axios.request(options);
  return data;
}

async function getPageId(email: string, questionId: string) {
  const options = {
    method: "POST",
    url: "https://leetnotion.codewithsathya.com/getPageId",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    data: {
      email,
      questionId 
    },
  };
  const { data } = await axios.request(options);
  return data;
}

async function appendBlock(secret, pageId, content) {
  const options = {
    method: "PATCH",
    url: `https://api.notion.com/v1/blocks/${pageId}/children`,
    headers: {
      Accept: "application/json",
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`
    },
    data: {
      children: [
        {
          object: "block",
          type: "code",
          code: {
            rich_text: [{ type: "text", text: { content } }],
            language: "java",
          },
        },
      ],
    },
  };
  let { data } = await axios.request(options);
  return data;
}


export async function updateNotionTasks(notionEmail, secret, code){
  let questionId = getId(code);
  let filteredCode = getCode(code);
  let pageId = await getPageId(notionEmail, questionId);
  await updatePage(secret, pageId);
  await appendBlock(secret, pageId, filteredCode);
}

function getId(code){
  let str = code.substring(code.indexOf("@lc") + 3, code.indexOf(" lang"));
  let id = str.substring(str.indexOf("id=") + 3, code.indexOf(" lang"));
  return id;
}

function getCode(code){
  let start = "// @lc code=start";
  let end = "// @lc code=end";
  let startIndex = code.indexOf(start) + start.length + 1;
  let endIndex = code.indexOf(end) - 1;
  return code.substring(startIndex, endIndex);
}

