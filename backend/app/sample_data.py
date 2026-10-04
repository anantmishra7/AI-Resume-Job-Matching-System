"""
Sample pre-loaded Job Descriptions and diverse Candidate Resumes.
Includes real-world matches, edge cases, junior candidates,
and a sneaky fraudulent / keyword-stuffed resume specifically designed
to demonstrate the Innovation / Bonus Contradiction Detection engine!
"""

from typing import List
from .models import JobDescription, CandidateProfile, WorkExperienceItem, EducationItem

SAMPLE_JOBS: List[JobDescription] = [
    JobDescription(
        id="job-fullstack",
        title="Senior Full-Stack Engineer",
        company="Stripe / FinTech Cloud",
        role_level="Senior",
        min_experience_years=4.0,
        required_education="Bachelor",
        required_skills=["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
        preferred_skills=["Docker", "GraphQL", "Redis", "CI/CD"],
        description_text=(
            "We are looking for a Senior Full-Stack Engineer to architect resilient distributed financial services. "
            "You will develop high-performance web applications using React, TypeScript, and modern Node.js/Express backends. "
            "You will design reliable relational database schemas on PostgreSQL, deploy containerized workloads to AWS, "
            "and build high-throughput GraphQL APIs. 4+ years of full-stack engineering experience and a Bachelor's degree required."
        )
    ),
    JobDescription(
        id="job-mle",
        title="Senior AI / ML Engineer",
        company="ScaleAI Labs",
        role_level="Senior",
        min_experience_years=3.0,
        required_education="Master",
        required_skills=["Python", "PyTorch", "LLMs", "RAG", "FastAPI"],
        preferred_skills=["Docker", "LangChain", "Scikit-Learn", "Vector Databases"],
        description_text=(
            "Join our Generative AI team building enterprise retrieval-augmented generation (RAG) platforms and agentic pipelines. "
            "You must have deep production expertise in Python, PyTorch, fine-tuning LLMs, and vector embeddings. "
            "You will build high-throughput microservices using FastAPI and containerize services with Docker. "
            "Requires at least 3 years of ML engineering experience and an advanced Master's degree or equivalent."
        )
    ),
    JobDescription(
        id="job-devops",
        title="Cloud DevOps & Platform Architect",
        company="Datadog Infrastructure",
        role_level="Lead",
        min_experience_years=5.0,
        required_education="Bachelor",
        required_skills=["Kubernetes", "AWS", "Terraform", "Docker", "CI/CD"],
        preferred_skills=["Linux", "Apache Kafka", "Prometheus", "Python"],
        description_text=(
            "Seeking an experienced Cloud Platform Architect to manage multi-region Kubernetes clusters on AWS. "
            "Responsible for Infrastructure as Code using Terraform, architecting GitOps CI/CD pipelines, "
            "and ensuring 99.99% system availability with automated Prometheus monitoring and container security."
        )
    ),
    JobDescription(
        id="job-frontend",
        title="Senior Frontend Engineer",
        company="Vercel / Design Systems",
        role_level="Senior",
        min_experience_years=3.5,
        required_education="Bachelor",
        required_skills=["React", "Next.js", "TypeScript", "Tailwind CSS"],
        preferred_skills=["Redux", "GraphQL", "Vite", "Unit Testing"],
        description_text=(
            "Looking for a Senior Frontend Engineer obsessed with performance and sleek UX. "
            "You will lead development of our responsive web dashboard using React 18, Next.js App Router, "
            "TypeScript, and Tailwind CSS. You will optimize web vitals, build fluid micro-interactions, "
            "and maintain rigorous unit testing standards."
        )
    )
]

# Raw text for 6 diverse candidates
SAMPLE_CANDIDATE_TEXTS = [
    # 1. Alex Rivera - High match for Full-Stack
    (
        "Alex_Rivera_FullStack.pdf",
        """Alex Rivera
alex.rivera@email.com | (555) 234-5678 | linkedin.com/in/alex-rivera | github.com/alexrivera-dev
Austin, TX

SUMMARY
Senior Full-Stack Engineer with 7+ years of experience architecting scalable cloud platforms, resilient microservices, and interactive frontend applications.

EXPERIENCE
Senior Software Engineer | CloudScale Inc.
2020 - Present
* Architected and delivered high-throughput financial web application using React, TypeScript, and Node.js serving 450,000 active users.
* Designed and optimized PostgreSQL database queries, reducing average latency by 38% under peak load.
* Deployed containerized microservices to AWS (ECS, S3, RDS) using automated CI/CD pipelines with GitHub Actions.
* Implemented distributed caching with Redis, reducing backend database pressure by 50%.

Full-Stack Developer | Nexus Digital
2017 - 2020
* Developed modern web dashboards using React, Redux, and Express.js with REST API and GraphQL endpoints.
* Integrated PostgreSQL transactional databases and wrote automated integration tests with Jest.
* Built Docker containers for local development and cloud staging environments.

EDUCATION
Bachelor of Science in Computer Science | University of Texas at Austin
Graduation Year: 2017

SKILLS
React, TypeScript, Node.js, PostgreSQL, AWS, Docker, Redis, GraphQL, CI/CD, Python, Git, REST API, Express.js
"""
    ),

    # 2. Dr. Elena Rostova - High match for AI/ML
    (
        "Elena_Rostova_AI_Scientist.pdf",
        """Dr. Elena Rostova
elena.rostova@ai-research.org | (555) 876-5432 | linkedin.com/in/elena-rostova | github.com/erostova
San Francisco, CA

SUMMARY
Senior AI / Machine Learning Scientist with 6+ years of research and production experience in Deep Learning, Large Language Models (LLMs), and RAG pipelines.

EXPERIENCE
Lead AI Research Engineer | DeepSynthetics
2021 - Present
* Designed and deployed production enterprise RAG systems using PyTorch, LangChain, and vector embeddings for Fortune 500 legal search.
* Fine-tuned open-source LLMs (Llama, Mistral) with PEFT and LoRA, achieving 94% benchmark accuracy on domain queries.
* Built high-throughput asynchronous inference API microservices using FastAPI and containerized with Docker on Kubernetes.
* Developed automated evaluation harness for model hallucinations and context recall.

Machine Learning Engineer | Apex Data Labs
2018 - 2021
* Built predictive NLP and classification models in Python using PyTorch, Scikit-Learn, and HuggingFace Transformers.
* Processed multi-terabyte datasets using Pandas, NumPy, and Apache Spark.
* Optimized model inference latency using ONNX and TensorRT.

EDUCATION
Ph.D. in Computer Science (Artificial Intelligence) | Stanford University
Graduation Year: 2018
Master of Science in Computer Science | Carnegie Mellon University
Graduation Year: 2014

SKILLS
Python, PyTorch, LLMs, RAG, FastAPI, Docker, LangChain, Scikit-Learn, TensorFlow, HuggingFace, Pandas, NumPy, Machine Learning, Deep Learning, Natural Language Processing
"""
    ),

    # 3. David Chen - Moderate Mid-Level Full-Stack
    (
        "David_Chen_Mid_FullStack.pdf",
        """David Chen
david.chen@email.com | (555) 432-1098 | linkedin.com/in/davidchen-dev | github.com/davidchen
Seattle, WA

SUMMARY
Full-Stack Developer with 3 years of hands-on experience building web applications using React, TypeScript, and Node.js.

EXPERIENCE
Software Engineer | BlueWave Tech
2021 - Present
* Built customer-facing responsive portal using React and TypeScript.
* Created RESTful APIs using Node.js and Express with PostgreSQL backend.
* Collaborated with senior engineers on Agile sprints and Git code reviews.

Junior Developer | PixelCraft
2020 - 2021
* Maintained internal dashboards using JavaScript and HTML5/CSS3.
* Assisted with simple database migrations on MySQL.

EDUCATION
Bachelor of Science in Computer Science | University of Washington
Graduation Year: 2021

SKILLS
React, TypeScript, Node.js, JavaScript, PostgreSQL, MySQL, HTML5, CSS3, Git, REST API
"""
    ),

    # 4. Marcus Vance - Junior Web Developer
    (
        "Marcus_Vance_Junior_Web.pdf",
        """Marcus Vance
marcus.vance@email.com | (555) 321-7654 | linkedin.com/in/marcusvance
Chicago, IL

SUMMARY
Junior Web Developer with 1.5 years of experience building modern web pages with HTML, CSS, JavaScript, and basic React components.

EXPERIENCE
Junior Frontend Developer | Local Agency Web
2023 - Present
* Developed landing pages and interactive components using HTML5, CSS3, JavaScript, and Tailwind CSS.
* Created simple client features with React and Vite.

Web Development Intern | StartSmart
2022 - 2023
* Assisted in fixing frontend bugs and updating CSS stylesheets.

EDUCATION
Associate Degree in Computer Information Systems | City College of Chicago
Graduation Year: 2023

SKILLS
JavaScript, HTML5, CSS3, Tailwind CSS, React, Git, Bootstrap
"""
    ),

    # 5. Vikram Patel - SNEAKY FRAUDULENT / KEYWORD-STUFFED RESUME (INNOVATION BONUS SHOWCASE)
    (
        "Vikram_Patel_Contradictory_Resume.pdf",
        """Vikram Patel
vikram.patel.superdev@email.com | (555) 999-1234 | linkedin.com/in/vikram-patel-superdev
New York, NY

SUMMARY
Visionary Senior Principal Enterprise Architect and AI Guru with 12 years of Flutter experience and 10 years of Kubernetes mastery. Expert in all modern cloud technologies.

EXPERIENCE
Principal Senior Enterprise Architect | Global MegaTech
2018 - Present
* Served as Senior Principal Architect leading large distributed systems.
* Oversaw various engineering initiatives.

Lead Software Architect | Overlap Corp
2019 - Present
* Simultaneously served as full-time Lead Architect on confidential software products (40 hrs/week).

Junior Web Intern | Summer Tech
2017 - 2018
* Built basic HTML pages and simple web scripts.

EDUCATION
Bachelor of Technology in Information Technology | Metro University
Graduation Year: 2023

SKILLS
React, Next.js, Vue.js, Angular, Svelte, TypeScript, JavaScript, Python, Go, Rust, Java, C++, C#, Ruby, PHP, Swift, Kotlin, Dart, Flutter, Kubernetes, Docker, AWS, Google Cloud, Microsoft Azure, Terraform, Ansible, PyTorch, TensorFlow, LLMs, RAG, LangChain, FastAPI, Django, Flask, Spring Boot, PostgreSQL, MySQL, MongoDB, Redis, Cassandra, Elasticsearch, GraphQL, gRPC, Apache Kafka, Linux, Tailwind CSS, HTML5, CSS3
"""
    ),

    # 6. Sarah Jenkins - High match for DevOps/Cloud
    (
        "Sarah_Jenkins_DevOps_Architect.pdf",
        """Sarah Jenkins
sarah.jenkins@cloudops.net | (555) 654-3210 | linkedin.com/in/sarahjenkins-devops | github.com/sjenkins-cloud
Denver, CO

SUMMARY
Cloud Platform and DevOps Engineer with 5.5 years of experience managing high-availability Kubernetes clusters, AWS cloud infrastructure, and GitOps CI/CD pipelines.

EXPERIENCE
Senior DevOps Engineer | SkyGrid Systems
2021 - Present
* Architected and managed production multi-tenant Kubernetes (EKS) clusters on AWS handling 250M daily requests.
* Authored modular Infrastructure as Code using Terraform to provision VPCs, ECS, RDS, and IAM policies.
* Built automated GitOps CI/CD pipelines using GitHub Actions, Helm, and ArgoCD, reducing release cycle time by 65%.
* Implemented infrastructure observability using Prometheus and Grafana on Linux servers.

Cloud Infrastructure Engineer | Altitude Networks
2019 - 2021
* Containerized legacy services with Docker and orchestrated deployments on AWS ECS.
* Maintained Linux production servers and implemented automated bash deployment scripts.
* Configured Apache Kafka clusters for streaming telemetry logs.

EDUCATION
Bachelor of Science in Information Technology | University of Colorado Boulder
Graduation Year: 2019

SKILLS
Kubernetes, AWS, Terraform, Docker, CI/CD, Linux, Helm, GitHub Actions, Apache Kafka, Prometheus, Python, Bash
"""
    )
]
