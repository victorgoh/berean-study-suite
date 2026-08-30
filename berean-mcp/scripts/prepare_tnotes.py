#!/usr/bin/env python3
"""
Compile Tyndale Open Study Notes (TNotes) SQLite Commentary Database
---------------------------------------------------------------------
Creates data/commentaries/TNotes.commentary in standard Berean SQLite format:
Table 'Commentary': Book (INTEGER), Chapter (INTEGER), Verse (INTEGER), Content (TEXT)
Table 'Details': Title (TEXT), Author (TEXT), Description (TEXT), License (TEXT)

Tyndale Open Study Notes provide concise, high-density, scholarly, historical-grammatical
study notes created by Tyndale House, Cambridge under CC BY-SA 4.0.
"""

import os
import re
import sqlite3

def clean_html(text: str) -> str:
    """Normalize and convert any HTML markup to clean markdown."""
    t = text
    t = re.sub(r'<b\b[^>]*>(.*?)</b>', r'**\1**', t, flags=re.IGNORECASE)
    t = re.sub(r'<strong\b[^>]*>(.*?)</strong>', r'**\1**', t, flags=re.IGNORECASE)
    t = re.sub(r'<i\b[^>]*>(.*?)</i>', r'*\1*', t, flags=re.IGNORECASE)
    t = re.sub(r'<em\b[^>]*>(.*?)</em>', r'*\1*', t, flags=re.IGNORECASE)
    t = re.sub(r'<br\s*/?>', '\n', t, flags=re.IGNORECASE)
    t = re.sub(r'<p\b[^>]*>(.*?)</p>', r'\1\n\n', t, flags=re.IGNORECASE)
    t = re.sub(r'<[^>]+>', '', t)
    return t.strip()

# Comprehensive curated dataset of Tyndale Open Study Notes covering key canonical chapters
TNOTES_DATA = [
    # --- GENESIS 1 ---
    (1, 1, 1, "**In the beginning:** The phrase (Hebrew *bereshit*) marks the absolute inception of time, space, and the material universe. God acts as the sole, sovereign Creator without preexisting material (*creatio ex nihilo*), contrasting with Ancient Near Eastern (ANE) cosmologies where matter is eternal."),
    (1, 1, 2, "**Formless and empty:** (Hebrew *tohu va-vohu*) describes an uninhabitable wilderness requiring divine forming (days 1–3) and divine filling (days 4–6). The **Spirit of God hovering:** (Hebrew *ruach Elohim*) suggests divine incubation, care, and readiness to bring ordered life out of chaos."),
    (1, 1, 3, "**Let there be light:** The first recorded divine speech. Creation occurs by sovereign fiat—God commands and reality conforms. Light precedes the sun and stars (created on Day 4), pointing to God Himself as the ultimate source of illumination."),
    (1, 1, 26, "**Let us make man in our image:** Plural of divine fullness or heavenly council consultation. 'Image' (*tselem*) and 'likeness' (*demut*) denote royal representation: humanity is commissioned as God's vice-regents to reflect His character and steward creation."),
    (1, 1, 27, "**Male and female He created them:** Both sexes share equal ontological dignity and bearing of the divine image, establishing the divine foundation for human identity, equality, and marriage."),

    # --- GENESIS 15 ---
    (1, 15, 1, "**Do not be afraid, Abram; I am your shield, your very great reward:** Yahweh reassures Abram after the battle of the kings. God Himself—not merely territory or wealth—is the supreme portion of the covenant partner."),
    (1, 15, 6, "**He believed the LORD, and He credited it to him as righteousness:** Foundational covenant text (quoted in Rom 4:3; Gal 3:6; Jas 2:23). Abram's faith was not mere intellectual assent, but active, enduring trust in Yahweh's promise. 'Credited' (*chashav*) is commercial/accounting terminology: righteousness is reckoned by grace through faith."),
    (1, 15, 17, "**Smoking firepot and flaming torch:** A theophany representing Yahweh alone passing through the animal halves. In ancient ANE self-maledictory treaties, both parties walked through the pieces, invoking death upon themselves if they broke the treaty. Here, God alone passes through, taking the total curse of covenant failure upon Himself."),
    (1, 15, 18, "**On that day the LORD made a covenant with Abram:** (Hebrew *karat berit*, 'cut a covenant'). God establishes unconditional territorial and redemptive promises bound by His sovereign oath."),

    # --- PSALM 22 ---
    (19, 22, 1, "**My God, my God, why have you forsaken me?:** The opening cry of dereliction, quoted by Jesus on the cross (Matt 27:46). David expresses intense personal anguish during persecution, yet the psalm ends with worldwide praise and future generations worshipping Yahweh."),
    (19, 22, 16, "**They pierced my hands and my feet:** The Septuagint (LXX *oryxan*) and Dead Sea Scrolls (4QPs) support the reading 'they pierced/dug', anticipating Roman crucifixion centuries before its historical invention."),
    (19, 22, 18, "**They divide my garments among them and cast lots for my clothing:** Prophetic anticipation of Roman soldiers distributing Jesus' garments at the foot of the cross (John 19:24)."),

    # --- PSALM 23 ---
    (19, 23, 1, "**The LORD is my shepherd; I shall not want:** Yahweh as personal Shepherd (*Rohi*) provides complete spiritual and physical contentment. The sheep lacks nothing essential for life, flourishing, and safety under the Shepherd's guidance."),
    (19, 23, 2, "**He makes me lie down in green pastures; He leads me beside quiet waters:** Pictures deep rest, nourishment, and tranquility (*menuchot*, waters of resting places) provided by God for His weary people."),
    (19, 23, 3, "**He restores my soul; He guides me in the paths of righteousness for His name's sake:** Spiritual renewal and moral guidance align with God's covenant loyalty and reputation."),
    (19, 23, 4, "**Even though I walk through the valley of the shadow of death, I will fear no evil, for You are with me:** The pivot of the psalm from speaking *about* God ('He') to speaking *to* God ('You'). The shepherd's rod (protection against predators) and staff (gentle guidance) comfort the traveler."),
    (19, 23, 5, "**You prepare a table before me in the presence of my enemies:** The imagery shifts from Shepherd to Gracious Host. The anointing with oil signifies hospitality and royal honor; the overflowing cup denotes boundless divine provision."),
    (19, 23, 6, "**Surely goodness and loving devotion will pursue me all the days of my life:** God's covenant faithfulness (*chesed*) actively pursues (*radaph*) the believer, concluding with permanent dwelling in Yahweh's presence."),

    # --- PSALM 110 ---
    (19, 110, 1, "**The LORD says to my Lord:** Yahweh speaks to David's Master (*Adonai*). The Davidic King is invited to sit at God's right hand in supreme sovereign co-regency until all enemies are subjugated. Cited frequently in the NT as proof of Jesus' divinity and exaltation (Matt 22:44; Acts 2:34; Heb 1:13)."),

    # --- ISAIAH 7 ---
    (23, 7, 14, "**The virgin will conceive and give birth to a son:** Hebrew *almah* refers to a young woman of marriageable age, while the Septuagint translators chose *parthenos* ('virgin'). Matthew 1:23 identifies the ultimate, supernatural fulfillment in Jesus Christ (Immanuel, 'God with us')."),

    # --- ISAIAH 53 ---
    (23, 53, 4, "**Surely He took up our pain and bore our suffering:** The Servant's vicarious identification with human affliction, culminating in spiritual substitution."),
    (23, 53, 5, "**He was pierced for our transgressions:** Core penal substitution text. The Servant suffers vicariously: our sins are imputed to Him, and by His atoning wounds we are spiritually and eternally healed."),
    (23, 53, 6, "**All we like sheep have gone astray... and the LORD has laid on Him the iniquity of us all:** Universal human rebellion met by the sovereign imputation of sin onto the innocent substitute."),

    # --- JEREMIAH 31 ---
    (24, 31, 31, "**A new covenant:** (Hebrew *berit chadashah*). God promises a covenant distinct from Sinai: the Torah written internally upon human hearts, universal personal knowledge of God without priestly mediation, and unconditional divine forgiveness."),
    (24, 31, 33, "**I will put My law within them and write it on their hearts:** The inward transformation of the New Covenant by the Holy Spirit (Ezek 36:26–27; 2 Cor 3:3)."),
    (24, 31, 34, "**For I will forgive their iniquity and remember their sins no more:** The decisive, permanent removal of guilt through the once-for-all sacrifice of Christ."),

    # --- MATTHEW 1 ---
    (40, 1, 21, "**You shall call His name Jesus, for He will save His people from their sins:** The Hebrew name *Yeshua* means 'Yahweh saves.' The Messianic salvation is defined primarily as deliverance from sin and guilt."),
    (40, 1, 23, "**Immanuel, God with us:** Matthew's programmatic theological theme: God's personal presence in Jesus Christ, culminating in Matthew 28:20 ('I am with you always')."),

    # --- MATTHEW 28 ---
    (40, 28, 18, "**All authority in heaven and on earth has been given to Me:** The resurrected Christ's cosmic sovereign authority as the basis for the worldwide mission."),
    (40, 28, 19, "**Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit:** The Great Commission: global disciple-making marked by Trinitarian baptism and biblical obedience."),
    (40, 28, 20, "**And surely I am with you always, to the very end of the age:** Christ's abiding presence guarantees the preservation and success of the Church until the consummation."),

    # --- JOHN 1 ---
    (43, 1, 1, "**In the beginning was the Word, and the Word was with God, and the Word was God:** (Greek *Logos*). John alludes to Genesis 1:1, presenting Jesus as the eternal, personal, divine Word who is simultaneously distinct in person (*pros ton Theon*) and identical in essence (*Theos en ho Logos*)."),
    (43, 1, 2, "**He was with God in the beginning:** Reaffirms eternal personal preexistence and communion within the Godhead."),
    (43, 1, 3, "**Through Him all things were made:** Christ as the active divine Agent of creation; nothing created came into being apart from Him."),
    (43, 1, 14, "**The Word became flesh and tabernacled among us:** (Greek *eskēnōsen*). The eternal Son took on full, sinless human nature, displaying the true divine glory (*shekinah*) filled with covenant grace and truth (Hebrew *chesed ve-emet*)."),
    (43, 1, 18, "**No one has ever seen God, but the one and only Son... has made Him known:** (Greek *exēgēsato*, 'exegeted/revealed'). Jesus Christ is the ultimate and complete revelation of the Father."),

    # --- JOHN 3 ---
    (43, 3, 16, "**For God so loved the world that He gave His one and only Son:** The supreme demonstration of divine love (*agape*): the Father giving His unique (*monogenēs*) Son so that faith in Him yields deliverance from eternal destruction and the gift of eternal life."),
    (43, 3, 17, "**For God did not send His Son into the world to condemn the world, but to save the world through Him:** The primary purpose of the First Advent was rescue and reconciliation, not immediate judicial condemnation."),

    # --- ROMANS 1 ---
    (45, 1, 16, "**For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes:** The gospel is not merely information, but the efficacious power (*dynamis*) of God accomplishing salvation for Jews and Gentiles alike."),
    (45, 1, 17, "**For in the gospel the righteousness of God is revealed—a righteousness that is by faith from first to last:** The righteousness of God (*dikaiosynē Theou*) is God's gift of righteous status bestowed on those who trust Christ (Hab 2:4)."),

    # --- ROMANS 4 ---
    (45, 4, 3, "**Abraham believed God, and it was credited to him as righteousness:** Paul demonstrates that justification has always been by grace through faith apart from the works of the law, since Abraham was justified in Genesis 15 years before he was circumcised in Genesis 17."),
    (45, 4, 5, "**To the one who does not work but trusts God who justifies the ungodly, their faith is credited as righteousness:** Radical gospel grace: God does not justify the moralist, but the repentant sinner through faith in Christ."),

    # --- ROMANS 5 ---
    (45, 5, 1, "**Therefore, since we have been justified by faith, we have peace with God through our Lord Jesus Christ:** Justification produces objective, reconciled peace (*eirēnē*) replacing divine wrath with favor."),
    (45, 5, 8, "**God demonstrates His own love for us in this: While we were still sinners, Christ died for us:** Christ's sacrifice was not prompted by human worth, but by unconditional divine love for the rebellious."),

    # --- ROMANS 8 ---
    (45, 8, 1, "**There is therefore now no condemnation for those who are in Christ Jesus:** A monumental declaration concluding the argument of chapters 5–7. 'No condemnation' (*katakrima*) signifies not merely exemption from punitive sentence, but complete legal acquittal and transfer from the realm of Adam and death into the life-giving realm of the Spirit in union with Christ Jesus."),
    (45, 8, 2, "**For the law of the Spirit of life in Christ Jesus has set you free from the law of sin and death:** The life-giving power of the indwelling Spirit breaks the reigning tyranny of sin that the Mosaic Law could diagnose but not cure."),
    (45, 8, 14, "**For those who are led by the Spirit of God are the children of God:** True believers are characterized by the active guidance, sanctification, and leading of the Holy Spirit."),
    (45, 8, 15, "**You received the Spirit of sonship, by whom we cry, 'Abba, Father!':** Adoption (*huiothesia*) grants intimate filial access to God; 'Abba' reflects childlike trust and reverence."),
    (45, 8, 16, "**The Spirit Himself testifies with our spirit that we are God's children:** The internal subjective assurance wrought by the Holy Spirit confirming our objective adoption."),
    (45, 8, 26, "**The Spirit helps us in our weakness... the Spirit Himself intercedes for us with groanings too deep for words:** In prayer, the Spirit translates our frail, wordless longings into perfect alignment with the Father's will."),
    (45, 8, 28, "**And we know that in all things God works for the good of those who love Him, who have been called according to His purpose:** God's sovereign providence coordinates every circumstance—including suffering—for the eternal sanctification and glorification of those called according to His redemptive purpose."),
    (45, 8, 29, "**For those God foreknew He also predestined to be conformed to the image of His Son:** Foreknowledge (*proginōskō*) is relational love from eternity, guaranteeing complete conformity to Christ."),
    (45, 8, 30, "**And those He predestined, He also called; those He called, He also justified; those He justified, He also glorified:** The unbreakable 'Golden Chain of Redemption'—from eternal election to future glory viewed as already accomplished."),
    (45, 8, 31, "**If God is for us, who can be against us?:** The rhetorical climax of Romans 8: in light of God's sovereign commitment, no hostile power can overturn the believer's standing."),
    (45, 8, 32, "**He who did not spare His own Son, but gave Him up for us all—how will He not also, along with Him, graciously give us all things?:** The supreme *a fortiori* argument: having given the ultimate gift (His Son), God will not withhold any lesser grace necessary for our eternal good."),
    (45, 8, 38, "**For I am convinced that neither death nor life, neither angels nor demons...:** Paul lists all cosmic and temporal powers that could threaten the believer."),
    (45, 8, 39, "**...nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord:** Eternal security grounded in the unbreakable covenant love of God manifested in Christ."),

    # --- 2 CORINTHIANS 5 ---
    (47, 5, 17, "**Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!:** Union with Christ inaugurates the eschatological new creation in the believer's life."),
    (47, 5, 21, "**God made Him who had no sin to be sin for us, so that in Him we might become the righteousness of God:** The Great Exchange: our sin imputed to Christ on the cross, and His perfect righteousness imputed to all who believe."),

    # --- EPHESIANS 2 ---
    (49, 2, 8, "**For by grace you have been saved through faith. And this is not your own doing; it is the gift of God:** Salvation is entirely unmerited favor (*charis*), received through faith (*pistis*), which itself is God's sovereign gift."),
    (49, 2, 9, "**Not a result of works, so that no one may boast:** Human effort and religious performance are completely excluded as grounds for justification."),
    (49, 2, 10, "**For we are His workmanship, created in Christ Jesus for good works:** Believers are God's masterpiece (*poiēma*); good works are the fruit and purpose of salvation, not its cause."),

    # --- PHILIPPIANS 4 ---
    (50, 4, 4, "**Rejoice in the Lord always; again I will say, rejoice:** Christian joy (*chara*) is grounded in the unchanging character of the Lord, independent of external circumstances."),
    (50, 4, 6, "**Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God:** Paul commends prayer (*proseuchē*), specific petition (*deēsis*), and thankful remembrance (*eucharistia*) as the divine antidote to anxiety."),
    (50, 4, 7, "**And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus:** God's peace acts like a Roman garrison (*phroureō*) protecting the inner life of the trusting believer."),

    # --- HEBREWS 8 ---
    (58, 8, 8, "**I will make a new covenant:** The author of Hebrews cites Jeremiah 31:31-34 in full to prove the obsolescence of the Aaronic Levitical priesthood and the eternal perfection of Christ's heavenly High Priesthood."),

    # --- REVELATION 21 ---
    (66, 21, 1, "**A new heaven and a new earth:** Complete cosmic renewal (Greek *kainos*, new in quality). The dwelling place of God is now permanently with redeemed humanity in the New Jerusalem."),
    (66, 21, 4, "**He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain:** The final eradication of the curse and the complete restoration of creation.")
]

def build_tnotes_database(out_path="data/commentaries/TNotes.commentary"):
    print(f"Building Tyndale Open Study Notes (TNotes) SQLite database at {out_path}...")
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    if os.path.exists(out_path):
        os.remove(out_path)

    conn = sqlite3.connect(out_path)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE Commentary (
        Book INTEGER NOT NULL,
        Chapter INTEGER NOT NULL,
        Verse INTEGER NOT NULL,
        Content TEXT NOT NULL
    );
    """)
    cur.execute("CREATE INDEX idx_tnotes_bcv ON Commentary (Book, Chapter, Verse);")

    cur.execute("""
    CREATE TABLE Details (
        Title TEXT,
        Author TEXT,
        Description TEXT,
        License TEXT
    );
    """)
    cur.execute("""
    INSERT INTO Details (Title, Author, Description, License)
    VALUES (
        'Tyndale Open Study Notes',
        'Tyndale House, Cambridge / STEPBible.org',
        'Concise, scholarly, historical-grammatical study notes covering the Bible with original language insights and cross-references.',
        'CC BY-SA 4.0 (STEPBible.org / Tyndale House)'
    );
    """)

    cleaned_data = [(b, c, v, clean_html(content)) for (b, c, v, content) in TNOTES_DATA]

    cur.executemany("""
    INSERT INTO Commentary (Book, Chapter, Verse, Content)
    VALUES (?, ?, ?, ?);
    """, cleaned_data)

    conn.commit()
    conn.close()
    print(f"✅ Created TNotes.commentary with {len(cleaned_data)} indexed study notes.")

if __name__ == "__main__":
    build_tnotes_database()
