import axios from 'axios'

async function updatePage(secret, pageId) {
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
      },
    },
  };
  let { data } = await axios.request(options);
  return data;
}

async function getPageId(secret, query) {
  const options = {
    method: "POST",
    url: "https://api.notion.com/v1/search",
    headers: {
      Accept: "application/json",
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`
    },
    data: {
      query,
      sort: {
        direction: "ascending",
        timestamp: "last_edited_time",
      },
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


export async function updateNotionTasks(secret, code){
  let question = getName(code);
  let filteredCode = getCode(code);
  let pageId = await getPageId(secret, question);
  if(pageId.results.length === 0) return;
  await updatePage(secret, pageId.results[0].id);
  await appendBlock(secret, pageId.results[0].id, filteredCode);
}

function getName(code){
  let str = code.substring(code.indexOf("/*\n") + 3, code.indexOf("*/")).split("\n")[2];
  let name = str.substring(str.indexOf("]") + 2);
  return name;
}

function getCode(code){
  let start = "// @lc code=start";
  let end = "// @lc code=end";
  let startIndex = code.indexOf(start) + start.length + 1;
  let endIndex = code.indexOf(end) - 1;
  return code.substring(startIndex, endIndex);
}

