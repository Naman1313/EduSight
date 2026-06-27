from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
import os

print("Loading knowledge base...")
with open("pdfs/edusight_knowledge_base.txt", "r") as f:
    content = f.read()

print("Splitting into chunks...")
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ".", " "]
)
chunks = splitter.create_documents([content])
print(f"Created {len(chunks)} chunks")

print("Loading embedding model (first time may take a minute)...")
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"}
)

print("Embedding and storing in ChromaDB...")
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

print(f"Done! {len(chunks)} chunks stored in ChromaDB")
print("Vector store saved to ./chroma_db")

query = "what to do when a student has many absences"
results = vectorstore.similarity_search(query, k=2)
print(f"\nTest query: '{query}'")
print(f"Top result preview: {results[0].page_content[:200]}")