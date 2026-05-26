from __future__ import annotations

from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "docs" / "report"
PDF_PATH = OUT_DIR / "rapport-smart-hire-ai.pdf"
IMAGE_DIR = Path("/Users/zaydlouly/.codex/generated_images/019e65ad-b1b4-7992-aaac-ed3fc2fe879c")
ENSI_LOGO_PATH = OUT_DIR / "extracted_assets" / "page01_01_Im1.png"


class SmartHireDocTemplate(BaseDocTemplate):
    def __init__(self, filename: str, **kwargs):
        super().__init__(filename, **kwargs)
        frame = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            id="normal",
        )
        self.addPageTemplates(
            [
                PageTemplate(
                    id="body",
                    frames=[frame],
                    onPage=self._header_footer,
                )
            ]
        )

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            text = flowable.getPlainText()
            style = flowable.style.name
            if style == "Heading1":
                self.notify("TOCEntry", (0, text, self.page))
            elif style == "Heading2":
                self.notify("TOCEntry", (1, text, self.page))

    def _header_footer(self, canvas, doc):
        canvas.saveState()
        width, height = A4
        if doc.page > 1:
            canvas.setStrokeColor(colors.HexColor("#D7DEE8"))
            canvas.setLineWidth(0.6)
            canvas.line(doc.leftMargin, height - 1.35 * cm, width - doc.rightMargin, height - 1.35 * cm)
            canvas.setFont("Helvetica", 8)
            canvas.setFillColor(colors.HexColor("#64748B"))
            canvas.drawString(doc.leftMargin, height - 1.05 * cm, "Smart Hire AI — Rapport Technique")
            canvas.drawRightString(width - doc.rightMargin, height - 1.05 * cm, "2025–2026")
        canvas.setStrokeColor(colors.HexColor("#D7DEE8"))
        canvas.setLineWidth(0.6)
        canvas.line(doc.leftMargin, 1.25 * cm, width - doc.rightMargin, 1.25 * cm)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#64748B"))
        canvas.drawRightString(width - doc.rightMargin, 0.82 * cm, f"Page {doc.page}")
        canvas.restoreState()


def styles():
    base = getSampleStyleSheet()
    return {
        "cover_school": ParagraphStyle(
            "cover_school",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=12,
            leading=16,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#334155"),
        ),
        "cover_title": ParagraphStyle(
            "cover_title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=34,
            leading=40,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#0F172A"),
            spaceAfter=8,
        ),
        "cover_subtitle": ParagraphStyle(
            "cover_subtitle",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=15,
            leading=22,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#475569"),
        ),
        "tech_badge": ParagraphStyle(
            "tech_badge",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#0F766E"),
        ),
        "Heading1": ParagraphStyle(
            "Heading1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=25,
            textColor=colors.HexColor("#0F172A"),
            spaceBefore=10,
            spaceAfter=10,
        ),
        "Heading2": ParagraphStyle(
            "Heading2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13.5,
            leading=18,
            textColor=colors.HexColor("#155E75"),
            spaceBefore=8,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15.5,
            alignment=TA_JUSTIFY,
            textColor=colors.HexColor("#1F2937"),
            spaceAfter=7,
        ),
        "body_left": ParagraphStyle(
            "body_left",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15.5,
            alignment=TA_LEFT,
            textColor=colors.HexColor("#1F2937"),
            spaceAfter=7,
        ),
        "caption": ParagraphStyle(
            "caption",
            parent=base["BodyText"],
            fontName="Helvetica-Oblique",
            fontSize=8.5,
            leading=12,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#64748B"),
            spaceBefore=4,
            spaceAfter=10,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.7,
            leading=12,
            textColor=colors.HexColor("#475569"),
        ),
        "table_header": ParagraphStyle(
            "table_header",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=colors.white,
            alignment=TA_CENTER,
        ),
        "table_cell": ParagraphStyle(
            "table_cell",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.7,
            leading=12,
            textColor=colors.HexColor("#1F2937"),
        ),
        "callout": ParagraphStyle(
            "callout",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#0F172A"),
            spaceAfter=0,
        ),
    }


S = styles()


def p(text: str, style: str = "body"):
    return Paragraph(text, S[style])


def h1(text: str):
    return Paragraph(text, S["Heading1"])


def h2(text: str):
    return Paragraph(text, S["Heading2"])


def bullet(items: list[str]):
    return ListFlowable(
        [ListItem(p(item, "body_left"), leftIndent=10) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=16,
        bulletFontName="Helvetica",
        bulletFontSize=7,
        spaceAfter=8,
    )


def numbered(items: list[str]):
    return ListFlowable(
        [ListItem(p(item, "body_left"), leftIndent=12) for item in items],
        bulletType="1",
        leftIndent=18,
        bulletFontName="Helvetica",
        bulletFontSize=9,
        spaceAfter=8,
    )


def table(data, widths=None, header=True):
    formatted = []
    for row_index, row in enumerate(data):
        formatted_row = []
        for cell in row:
            style = "table_header" if row_index == 0 and header else "table_cell"
            formatted_row.append(Paragraph(str(cell), S[style]))
        formatted.append(formatted_row)
    t = Table(formatted, colWidths=widths, hAlign="LEFT", repeatRows=1 if header else 0)
    style = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#CBD5E1")),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#FFFFFF")),
    ]
    if header:
        style.extend(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F766E")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ]
        )
    t.setStyle(TableStyle(style))
    return t


def callout(title: str, text: str):
    data = [[Paragraph(f"<b>{title}</b><br/>{text}", S["callout"])]]
    t = Table(data, colWidths=[16.2 * cm], hAlign="LEFT")
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#ECFDF5")),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#99F6E4")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return KeepTogether([t, Spacer(1, 8)])


def figure(image_path: Path, caption: str):
    img = Image(str(image_path), width=15.5 * cm, height=8.72 * cm)
    return KeepTogether([img, p(caption, "caption")])


def add_cover(story):
    logo_block = []
    if ENSI_LOGO_PATH.exists():
        logo_block = [
            Image(str(ENSI_LOGO_PATH), width=7.2 * cm, height=3.48 * cm),
            Spacer(1, 0.25 * cm),
        ]
    story.extend(
        [
            Spacer(1, 0.15 * cm),
            *logo_block,
            p("École des Nouvelles Sciences et Ingénierie", "cover_school"),
            p("Année Académique 2025–2026", "cover_school"),
            Spacer(1, 0.8 * cm),
            p("Rapport Technique de Projet", "cover_school"),
            Spacer(1, 0.5 * cm),
            p("SMART HIRE AI", "cover_title"),
            p(
                "Plateforme intelligente de recrutement, d’analyse de CV et de matching candidat–emploi",
                "cover_subtitle",
            ),
            Spacer(1, 0.7 * cm),
            table(
                [["Angular 19", "Spring Boot", "PostgreSQL + pgvector", "FastAPI", "IA / Embeddings"]],
                widths=[3.1 * cm] * 5,
                header=False,
            ),
            Spacer(1, 1.5 * cm),
            table(
                [
                    ["Membre", "Rôle"],
                    ["Zayd Louly", "Intelligence Artificielle"],
                    ["Houdaifa Zobair", "Développement Frontend"],
                    ["Khalidou Mahmadou Maiga", "DevOps"],
                    ["Soufiane Meskine", "Sécurité"],
                    ["Maissae Belkhir", "Développement Backend"],
                ],
                widths=[6.2 * cm, 9.5 * cm],
            ),
            Spacer(1, 1.2 * cm),
            p(
                "Version de rapport générée le "
                + date.today().strftime("%d/%m/%Y")
                + ".",
                "small",
            ),
            PageBreak(),
        ]
    )


def add_summary(story):
    story.extend(
        [
            h1("Résumé Exécutif"),
            h2("Aperçu du Projet"),
            p(
                "Smart Hire AI est une plateforme web de recrutement assistée par intelligence artificielle. "
                "Elle répond à un problème fréquent dans les processus RH : la sélection manuelle des CV est lente, "
                "coûteuse et parfois subjective. La solution centralise les offres d’emploi, les profils candidats, "
                "les CV versionnés et les traitements IA permettant d’extraire automatiquement les compétences utiles."
            ),
            p(
                "Le projet est construit autour d’une architecture en trois parties : une interface Angular pour les "
                "candidats et recruteurs, une API Spring Boot pour la logique métier et la persistance, et un service "
                "Python FastAPI dédié au parsing de CV, à l’extraction de compétences et à la génération de vecteurs "
                "d’embedding. PostgreSQL est utilisé comme base principale, avec l’extension pgvector pour préparer "
                "le matching sémantique entre offres et candidats."
            ),
            callout(
                "Idée centrale",
                "Transformer un CV non structuré en données exploitables, puis comparer ces données aux critères "
                "d’une offre afin d’aider le recruteur à prioriser les meilleurs profils.",
            ),
            h2("Points Forts"),
            bullet(
                [
                    "Architecture séparée entre frontend, backend Java et microservice IA Python.",
                    "Authentification JWT avec distinction des rôles candidat et recruteur.",
                    "Upload de CV avec versioning, extraction de texte PDF et extraction de compétences.",
                    "Gestion des offres d’emploi avec colonnes métier enrichies et écran de mise à jour.",
                    "Préparation du matching vectoriel avec embeddings 384 dimensions et pgvector.",
                    "Interface candidat améliorée pour visualiser les compétences extraites et relancer l’analyse.",
                ]
            ),
            h2("Axes d’Amélioration"),
            bullet(
                [
                    "Finaliser l’écran de classement des meilleurs candidats pour chaque offre.",
                    "Ajouter une explication visuelle du score de compatibilité candidat–emploi.",
                    "Renforcer les tests end-to-end sur les parcours candidat et recruteur.",
                    "Connecter le chatbot recruteur à un backend IA réel pour assister la création d’offres.",
                    "Ajouter des recommandations de formations en fonction des compétences manquantes.",
                ]
            ),
            PageBreak(),
        ]
    )


def add_toc(story):
    story.append(h1("Table des matières"))
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle(
            name="TOCHeading1",
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=15,
            leftIndent=0,
            firstLineIndent=0,
            spaceBefore=5,
        ),
        ParagraphStyle(
            name="TOCHeading2",
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            leftIndent=16,
            firstLineIndent=0,
        ),
    ]
    story.append(toc)
    story.append(PageBreak())


def add_intro(story):
    story.extend(
        [
            h1("1. Introduction et Contexte"),
            h2("1.1 Contexte du Projet"),
            p(
                "Dans un marché du travail de plus en plus numérique, les entreprises reçoivent souvent un volume "
                "important de candidatures. Les recruteurs doivent lire des CV hétérogènes, comparer des expériences "
                "difficiles à standardiser et repérer rapidement les compétences réellement pertinentes. Ce travail "
                "manuel augmente le temps de recrutement et peut introduire des biais dans la présélection."
            ),
            p(
                "Smart Hire AI propose une approche plus structurée : les candidats déposent leurs CV, la plateforme "
                "en extrait les informations importantes, puis le recruteur peut créer des offres détaillées et préparer "
                "un classement intelligent des profils. La plateforme ne remplace pas la décision humaine ; elle sert "
                "d’outil d’aide à la décision pour réduire la charge répétitive et rendre la comparaison plus lisible."
            ),
            h2("1.2 Objectifs du Projet"),
            numbered(
                [
                    "Permettre aux candidats de créer un profil et de déposer plusieurs versions de leur CV.",
                    "Extraire automatiquement les compétences, le niveau d’étude et l’expérience depuis un fichier PDF.",
                    "Permettre aux recruteurs de publier, consulter et modifier leurs propres offres d’emploi.",
                    "Préparer un moteur de matching intelligent basé sur les compétences et les embeddings sémantiques.",
                    "Construire une application claire, professionnelle et facilement présentable dans un cadre académique.",
                ]
            ),
            h2("1.3 Périmètre Fonctionnel"),
            table(
                [
                    ["Acteur", "Fonctionnalités principales"],
                    [
                        "Candidat",
                        "Inscription, connexion, upload de CV, versioning, extraction de compétences, consultation du profil enrichi.",
                    ],
                    [
                        "Recruteur",
                        "Création d’offres, consultation de ses offres, modification d’une offre, préparation du classement des candidats.",
                    ],
                    [
                        "Service IA",
                        "Parsing PDF, extraction structurée, génération d’embeddings et préparation du matching vectoriel.",
                    ],
                    [
                        "Administrateur / système",
                        "Persistance PostgreSQL, stockage de fichiers, sécurité JWT et séparation des responsabilités.",
                    ],
                ],
                widths=[3.2 * cm, 12.5 * cm],
            ),
            h2("1.4 Méthodologie"),
            p(
                "Le développement a suivi une approche incrémentale. Les fonctionnalités ont été ajoutées par petites "
                "étapes : d’abord les modèles candidats et offres, puis l’authentification, les tableaux de bord, l’upload "
                "de CV, l’extraction IA et enfin la préparation des embeddings. Cette méthode permet de garder un projet "
                "démontrable à chaque étape tout en conservant une base technique simple à expliquer."
            ),
            PageBreak(),
        ]
    )


def add_architecture(story):
    story.extend(
        [
            h1("2. Architecture Technique"),
            h2("2.1 Vue d’Ensemble"),
            p(
                "L’architecture de Smart Hire AI est volontairement séparée en couches. Le frontend Angular gère "
                "l’expérience utilisateur, le backend Spring Boot centralise les règles métier et la sécurité, tandis "
                "que le microservice Python exécute les traitements IA. Cette séparation facilite les démonstrations, "
                "les tests et l’évolution future du projet."
            ),
            table(
                [
                    ["Couche", "Technologies", "Responsabilité"],
                    ["Frontend", "Angular 19, TypeScript, Tailwind CSS", "Pages candidat/recruteur, formulaires, dashboards et appels API."],
                    ["Backend", "Java, Spring Boot, Spring Data JPA, Maven", "Authentification, CRUD métier, orchestration IA, persistance."],
                    ["Base de données", "PostgreSQL, pgvector", "Stockage des utilisateurs, CV, offres, compétences et embeddings."],
                    ["IA", "Python, FastAPI, pdfplumber, sentence-transformers", "Parsing PDF, extraction de compétences et génération de vecteurs."],
                    ["Stockage fichiers", "API compatible R2", "Upload et récupération des CV déposés par les candidats."],
                ],
                widths=[3.1 * cm, 4.5 * cm, 8.1 * cm],
            ),
            h2("2.2 Flux Général"),
            numbered(
                [
                    "Un utilisateur s’inscrit avec un rôle : candidat ou recruteur.",
                    "Le candidat dépose un CV PDF. Le backend stocke le fichier et crée une nouvelle version.",
                    "Le backend envoie le CV au service Python afin d’extraire le texte puis les compétences.",
                    "Les données extraites sont sauvegardées dans PostgreSQL et affichées dans le tableau de bord candidat.",
                    "Le recruteur crée ou modifie une offre. Le backend construit un texte d’embedding représentant l’offre.",
                    "Le service IA transforme ce texte en vecteur. PostgreSQL stocke ce vecteur via pgvector.",
                    "Le classement futur comparera les vecteurs des offres et des candidats pour identifier les profils proches.",
                ]
            ),
            h2("2.3 Structure du Dépôt"),
            table(
                [
                    ["Répertoire", "Description"],
                    ["frontend-angular/", "Application Angular active : routes, pages, services HTTP, guards et UI."],
                    ["backend/", "API Spring Boot : contrôleurs, services, entités, repositories, DTO et tests."],
                    ["ai-service/", "Microservice FastAPI : parsing CV, extraction, matching et embeddings."],
                    ["docs/report/", "Génération du présent rapport technique."],
                ],
                widths=[4.2 * cm, 11.5 * cm],
            ),
            PageBreak(),
        ]
    )


def add_ui(story, images):
    story.extend(
        [
            h1("3. Interfaces Utilisateur"),
            h2("3.1 Expérience Candidat"),
            p(
                "Le candidat dispose d’un parcours centré sur son profil professionnel. Après connexion, il peut déposer "
                "un CV, suivre les versions déposées et consulter les compétences extraites. L’objectif de l’interface "
                "est de transformer une action simple, l’upload d’un fichier PDF, en un profil structuré et exploitable."
            ),
            figure(images[0], "Figure 3.1 — Upload et versioning de CV côté candidat."),
            h2("3.2 Affichage des Compétences"),
            p(
                "La section compétences a été améliorée pour éviter un état vide peu convaincant. Elle affiche désormais "
                "les compétences sous forme de badges lisibles, des informations de profil et un bouton permettant de "
                "relancer l’extraction lorsque le candidat ajoute une nouvelle version de son CV."
            ),
            figure(images[1], "Figure 3.2 — Visualisation des compétences extraites depuis le CV."),
            h2("3.3 Expérience Recruteur"),
            p(
                "Le recruteur consulte ses propres offres et peut ouvrir une offre spécifique pour voir ses détails et "
                "la modifier. L’écran de détail prépare aussi l’emplacement du futur classement des meilleurs candidats, "
                "basé sur les embeddings et la similarité sémantique."
            ),
            figure(images[2], "Figure 3.3 — Gestion des offres et mise à jour par le recruteur."),
            h2("3.4 Chatbot Recruteur"),
            p(
                "Lors de la création d’une nouvelle offre, l’interface prévoit une alternative entre le formulaire classique "
                "et une expérience conversationnelle. Le chatbot n’a pas encore de backend IA connecté, mais son design "
                "pose les bases d’un assistant capable d’aider le recruteur à formuler une offre plus complète."
            ),
            bullet(
                [
                    "Mode formulaire : contrôle précis des champs obligatoires et optionnels.",
                    "Mode chatbot : expérience guidée pour les recruteurs moins techniques.",
                    "Objectif futur : générer automatiquement une offre structurée à partir d’un échange simple.",
                ]
            ),
            PageBreak(),
        ]
    )


def add_auth_backend(story):
    story.extend(
        [
            h1("4. Backend et Authentification"),
            h2("4.1 Modèle Utilisateur"),
            p(
                "Le backend utilise une table principale des utilisateurs afin d’unifier les comptes candidats et recruteurs. "
                "Cette décision évite les incohérences de clés étrangères : lorsqu’un recruteur crée une offre, l’identifiant "
                "du recruteur correspond à un utilisateur existant dans la table users."
            ),
            table(
                [
                    ["Concept", "Rôle dans le système"],
                    ["User", "Identité commune : nom, email, mot de passe, rôle."],
                    ["Candidate", "Profil candidat relié à un utilisateur de rôle CANDIDATE."],
                    ["Job", "Offre d’emploi reliée à un utilisateur recruteur."],
                    ["CvVersion", "Version d’un CV uploadé, avec statut de parsing et date d’analyse."],
                    ["CandidateSkill", "Compétence extraite ou enregistrée pour un candidat."],
                ],
                widths=[4 * cm, 11.7 * cm],
            ),
            h2("4.2 Sécurité JWT"),
            p(
                "L’authentification repose sur des tokens JWT. Après une connexion réussie, le frontend stocke le token "
                "et l’envoie dans les requêtes protégées. Les guards Angular limitent l’accès aux pages selon le rôle, "
                "tandis que le backend vérifie l’identité de l’utilisateur avant de créer ou modifier les données sensibles."
            ),
            h2("4.3 API Principales"),
            table(
                [
                    ["Endpoint", "Méthode", "Description"],
                    ["/api/auth/register", "POST", "Création d’un compte candidat ou recruteur."],
                    ["/api/auth/login", "POST", "Connexion et récupération du token JWT."],
                    ["/api/jobs", "POST", "Création d’une offre par un recruteur authentifié."],
                    ["/api/jobs/my", "GET", "Liste des offres appartenant au recruteur connecté."],
                    ["/api/jobs/{id}", "GET/PUT", "Consultation et modification d’une offre spécifique."],
                    ["/api/candidate/cvs", "GET/POST", "Liste et upload des versions de CV."],
                    ["/api/candidate/cvs/{id}/extract-skills", "POST", "Relance manuelle de l’extraction IA."],
                    ["/api/candidates/me", "GET", "Profil candidat enrichi pour le dashboard."],
                ],
                widths=[5.4 * cm, 2.1 * cm, 8.2 * cm],
            ),
            PageBreak(),
        ]
    )


def add_cv_ai(story):
    story.extend(
        [
            h1("5. Pipeline CV et Intelligence Artificielle"),
            h2("5.1 Upload et Versioning"),
            p(
                "La plateforme permet au candidat d’ajouter plusieurs versions de son CV. Chaque upload crée une entrée "
                "CvVersion indépendante, ce qui rend possible le suivi de l’évolution du profil. Cette approche est "
                "importante car un candidat peut améliorer son CV, ajouter une nouvelle expérience ou corriger ses compétences."
            ),
            h2("5.2 Parsing Automatique"),
            p(
                "Après l’upload, le backend appelle automatiquement le service Python. Le fichier PDF est téléchargé depuis "
                "le stockage, transmis au microservice IA, puis analysé. Le service extrait le texte brut, recherche les "
                "compétences connues, détecte l’expérience et identifie le niveau d’éducation lorsque c’est possible."
            ),
            table(
                [
                    ["Étape", "Traitement", "Résultat"],
                    ["1", "Upload du fichier PDF", "Nouvelle version de CV stockée."],
                    ["2", "Téléchargement serveur", "Fichier récupérable pour analyse."],
                    ["3", "Parsing PDF", "Texte brut extrait du CV."],
                    ["4", "Extraction structurée", "Compétences, expérience et éducation."],
                    ["5", "Persistance", "Profil candidat mis à jour dans PostgreSQL."],
                    ["6", "Embedding", "Vecteur candidat généré pour le matching futur."],
                ],
                widths=[1.4 * cm, 5.8 * cm, 8.5 * cm],
            ),
            h2("5.3 Extraction des Compétences"),
            p(
                "La première version de l’extraction utilise une approche compréhensible et présentable : une liste de "
                "compétences connues et des règles de détection. Ce choix est volontaire, car il permet d’expliquer le "
                "fonctionnement sans dépendre immédiatement d’un grand modèle opaque. La plateforme est néanmoins prête "
                "à évoluer vers des modèles plus avancés."
            ),
            h2("5.4 Endpoint IA"),
            table(
                [
                    ["Endpoint Python", "Rôle"],
                    ["/health", "Vérifier que le microservice IA fonctionne."],
                    ["/parse-cv", "Recevoir un fichier CV et retourner un profil structuré."],
                    ["/match", "Calculer un score simple basé sur compétences, expérience et éducation."],
                    ["/embed", "Transformer un texte de profil ou d’offre en vecteur de 384 dimensions."],
                ],
                widths=[4 * cm, 11.7 * cm],
            ),
            PageBreak(),
        ]
    )


def add_embeddings(story, images):
    story.extend(
        [
            h1("6. Matching et Embeddings"),
            h2("6.1 Limite du Matching par Mots-Clés"),
            p(
                "Un matching simple par mots-clés est facile à comprendre, mais il peut manquer des correspondances "
                "sémantiques. Par exemple, un candidat indiquant “développement backend Java” peut être pertinent pour "
                "une offre demandant “Spring Boot API”, même si les mots exacts ne sont pas identiques."
            ),
            h2("6.2 Approche Vectorielle"),
            p(
                "Pour préparer un matching plus intelligent, Smart Hire AI génère un texte représentatif pour chaque "
                "offre et chaque candidat. Ce texte est envoyé au service Python, qui produit un vecteur de 384 dimensions "
                "avec le modèle all-MiniLM-L6-v2 lorsque celui-ci est disponible. Les vecteurs sont stockés dans PostgreSQL "
                "avec l’extension pgvector."
            ),
            figure(images[3], "Figure 6.1 — Principe du classement des candidats par similarité vectorielle."),
            h2("6.3 Stockage pgvector"),
            table(
                [
                    ["Table", "Colonnes ajoutées", "Utilisation"],
                    ["jobs", "embedding_text, embedding_updated_at, embedding", "Représentation textuelle et vectorielle d’une offre."],
                    ["candidates", "embedding_text, embedding_updated_at, embedding", "Représentation textuelle et vectorielle d’un profil candidat."],
                ],
                widths=[3 * cm, 5.4 * cm, 7.3 * cm],
            ),
            h2("6.4 Comparaison Prévue"),
            p(
                "La prochaine étape consiste à exposer un endpoint backend retournant les meilleurs candidats pour une "
                "offre. La requête PostgreSQL pourra utiliser la distance cosinus de pgvector afin de trier les candidats "
                "dont le vecteur est le plus proche du vecteur de l’offre."
            ),
            callout(
                "Formule envisagée",
                "score = 1 - distance_cosinus(candidat.embedding, job.embedding). Ce score pourra ensuite être combiné "
                "avec les règles métier existantes : compétences, expérience minimale et niveau d’étude.",
            ),
            PageBreak(),
        ]
    )


def add_database_security(story):
    story.extend(
        [
            h1("7. Base de Données et Persistance"),
            h2("7.1 Modèle Relationnel"),
            p(
                "La base PostgreSQL stocke les données métier principales : utilisateurs, profils candidats, offres, "
                "compétences, versions de CV et embeddings. Les relations sont importantes pour garantir que chaque "
                "offre appartient à un recruteur existant et que chaque CV appartient à un candidat identifié."
            ),
            table(
                [
                    ["Entité", "Champs importants", "Relations"],
                    ["User", "id, fullName, email, password, role", "Un utilisateur peut être candidat ou recruteur."],
                    ["Candidate", "experienceYears, educationLevel, embeddingText", "Relié à User ; possède des compétences et CV."],
                    ["Job", "title, company, location, type, requiredSkills, embeddingText", "Relié à User recruteur."],
                    ["CvVersion", "fileUrl, version, parseStatus, parsedAt", "Relié au candidat."],
                    ["CandidateSkill", "name", "Relié au candidat."],
                ],
                widths=[3.1 * cm, 6.2 * cm, 6.4 * cm],
            ),
            h2("7.2 Migration et Cohérence"),
            p(
                "Une attention particulière a été portée à la cohérence des clés étrangères. Les comptes doivent être "
                "créés dans la table users, car les offres référencent le recruteur via recruiter_id. Cette correction "
                "évite l’erreur PostgreSQL liée à une offre créée avec un recruteur inexistant."
            ),
            h2("7.3 Sécurité des Données"),
            bullet(
                [
                    "Les identifiants de base de données sont gardés hors du dépôt Git grâce au fichier .env local.",
                    "Les mots de passe utilisateur ne doivent pas être stockés en clair.",
                    "Les endpoints sensibles vérifient le rôle et l’identité du demandeur.",
                    "Les fichiers CV sont traités comme des données personnelles et doivent rester accessibles uniquement au candidat concerné et aux workflows autorisés.",
                ]
            ),
            PageBreak(),
        ]
    )


def add_quality(story):
    story.extend(
        [
            h1("8. Qualité du Code et Tests"),
            h2("8.1 Organisation Backend"),
            p(
                "Le backend suit une structure classique Spring Boot : les contrôleurs exposent les endpoints, les services "
                "portent la logique métier, les repositories accèdent aux données et les DTO évitent d’exposer directement "
                "les entités internes. Cette organisation est lisible et adaptée à un projet académique."
            ),
            h2("8.2 Tests Réalisés"),
            table(
                [
                    ["Zone", "Vérification"],
                    ["Jobs", "Création, consultation des offres du recruteur, détail et mise à jour."],
                    ["CV", "Upload, versioning et relance de l’extraction de compétences."],
                    ["Build frontend", "Compilation Angular après ajout des écrans candidat et recruteur."],
                    ["IA", "Compilation Python et test direct de génération d’embedding 384 dimensions."],
                    ["Base", "Vérification de l’extension pgvector et des colonnes embedding."],
                ],
                widths=[4 * cm, 11.7 * cm],
            ),
            h2("8.3 Points de Vigilance"),
            bullet(
                [
                    "Le parsing PDF dépend de la qualité du CV : un PDF scanné en image nécessite probablement de l’OCR.",
                    "La liste de compétences doit être enrichie progressivement pour couvrir davantage de métiers.",
                    "Le chatbot recruteur est pour l’instant une interface de démonstration sans backend IA.",
                    "Le score vectoriel doit être expliqué visuellement pour rester compréhensible par les recruteurs.",
                ]
            ),
            PageBreak(),
        ]
    )


def add_future(story):
    story.extend(
        [
            h1("9. Fonctionnalités Futures"),
            h2("9.1 Classement des Meilleurs Candidats"),
            p(
                "La prochaine fonctionnalité majeure consiste à afficher, pour chaque offre, une liste de candidats "
                "classés par pertinence. Le recruteur pourra ouvrir une offre et visualiser les profils les plus proches, "
                "avec un score global et des explications : compétences communes, compétences manquantes, expérience "
                "suffisante ou insuffisante, et niveau d’étude."
            ),
            h2("9.2 Recommandations de Formation"),
            p(
                "Lorsque des compétences manquent à un candidat, la plateforme pourra suggérer des formations ciblées. "
                "Cette fonctionnalité transforme Smart Hire AI en outil d’accompagnement, pas seulement de sélection."
            ),
            h2("9.3 Chatbot Recruteur Connecté"),
            p(
                "Le chatbot recruteur pourra à terme générer une offre structurée à partir d’une conversation : titre, "
                "mission, compétences requises, niveau d’expérience, type de contrat et localisation. Le recruteur pourra "
                "ensuite valider ou modifier le résultat avant publication."
            ),
            h2("9.4 OCR et Analyse Avancée"),
            p(
                "Pour les CV scannés ou très graphiques, l’ajout d’un module OCR permettra de récupérer le texte même "
                "lorsque le PDF ne contient pas de couche texte exploitable. Une extraction plus avancée pourra aussi "
                "identifier les expériences par période, les projets et les certifications."
            ),
            PageBreak(),
        ]
    )


def add_conclusion(story):
    story.extend(
        [
            h1("10. Conclusion"),
            h2("10.1 Bilan"),
            p(
                "Smart Hire AI démontre une solution complète et progressive pour moderniser le recrutement. Le projet "
                "couvre déjà les fondations essentielles : authentification, rôles, gestion des offres, upload et versioning "
                "des CV, extraction automatique des compétences, stockage vectoriel et préparation du matching IA."
            ),
            p(
                "L’intérêt principal du projet est sa cohérence technique : chaque couche a un rôle clair. Angular fournit "
                "l’expérience utilisateur, Spring Boot sécurise et orchestre les données, PostgreSQL conserve les informations "
                "métier, et FastAPI isole les traitements IA. Cette architecture rend le projet explicable, maintenable "
                "et extensible."
            ),
            h2("10.2 Perspective Générale"),
            p(
                "La suite naturelle est l’activation complète du classement des candidats. Une fois ce module finalisé, "
                "la plateforme pourra montrer concrètement comment l’IA aide le recruteur à passer d’une liste brute de "
                "CV à une sélection priorisée et argumentée."
            ),
            callout(
                "Conclusion finale",
                "Smart Hire AI n’a pas pour objectif de remplacer le recruteur, mais de lui donner une lecture plus rapide, "
                "plus structurée et plus intelligente des candidatures.",
            ),
            PageBreak(),
        ]
    )


def add_appendices(story):
    story.extend(
        [
            h1("Annexe A — Glossaire"),
            table(
                [
                    ["Terme", "Définition"],
                    ["CV parsing", "Extraction automatique du texte et des informations importantes depuis un CV."],
                    ["Embedding", "Vecteur numérique représentant le sens d’un texte."],
                    ["pgvector", "Extension PostgreSQL permettant de stocker et comparer des vecteurs."],
                    ["JWT", "Token utilisé pour authentifier les requêtes API."],
                    ["DTO", "Objet de transfert de données utilisé entre backend et frontend."],
                    ["FastAPI", "Framework Python utilisé pour exposer rapidement des endpoints IA."],
                ],
                widths=[4 * cm, 11.7 * cm],
            ),
            h1("Annexe B — Synthèse des Routes Frontend"),
            table(
                [
                    ["Route", "Rôle"],
                    ["/", "Page d’accueil publique."],
                    ["/login", "Connexion utilisateur."],
                    ["/register", "Création de compte."],
                    ["/candidate", "Dashboard candidat."],
                    ["/candidate/profile", "Profil candidat."],
                    ["/recruiter", "Dashboard recruteur."],
                    ["/recruiter/jobs/new", "Création d’une offre."],
                    ["/recruiter/jobs/:id", "Détail et modification d’une offre."],
                    ["/settings", "Paramètres du compte."],
                ],
                widths=[5 * cm, 10.7 * cm],
            ),
            h1("Annexe C — Formule de Matching Initiale"),
            p(
                "La logique métier initiale proposée pour le matching explicable est la suivante : 50 % compétences, "
                "30 % expérience et 20 % niveau d’étude. Cette formule peut coexister avec le score vectoriel afin de "
                "garder un résultat compréhensible pour les recruteurs et les enseignants."
            ),
            table(
                [
                    ["Critère", "Poids", "Explication"],
                    ["Compétences", "50 %", "Mesure la couverture des compétences demandées par l’offre."],
                    ["Expérience", "30 %", "Compare les années d’expérience du candidat au minimum requis."],
                    ["Éducation", "20 %", "Vérifie la compatibilité du niveau d’étude."],
                ],
                widths=[4 * cm, 2.5 * cm, 9.2 * cm],
            ),
        ]
    )


def build_story():
    images = sorted(IMAGE_DIR.glob("*.png"))
    if len(images) < 4:
        raise RuntimeError(f"Expected at least 4 generated images in {IMAGE_DIR}")

    story = []
    add_cover(story)
    add_summary(story)
    add_toc(story)
    add_intro(story)
    add_architecture(story)
    add_ui(story, images)
    add_auth_backend(story)
    add_cv_ai(story)
    add_embeddings(story, images)
    add_database_security(story)
    add_quality(story)
    add_future(story)
    add_conclusion(story)
    add_appendices(story)
    return story


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = SmartHireDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        rightMargin=2.2 * cm,
        leftMargin=2.2 * cm,
        topMargin=1.85 * cm,
        bottomMargin=1.75 * cm,
        title="Smart Hire AI - Rapport Technique",
        author="Équipe Smart Hire AI",
        subject="Plateforme intelligente de recrutement",
    )
    story = build_story()
    doc.multiBuild(story)
    print(PDF_PATH)


if __name__ == "__main__":
    main()
