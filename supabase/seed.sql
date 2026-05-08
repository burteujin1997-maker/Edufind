-- EduFind.mn Seed Data
-- schema.sql-г эхлээд ажиллуулсны дараа энийг ажиллуулна уу

insert into schools (name, slug, category, district, phone, website, description, features, tuition_min, tuition_max, is_featured, is_verified) values

-- ЕБС
('Шинэ Монгол ЕБС', 'shine-mongol-ebs', 'ebs', 'БЗД', '7777-5599', 'shinemongol.edu.mn',
 'Шинэ Монгол ЕБС нь 1994 онд үүсгэн байгуулагдсан бөгөөд Grapeseed, STEM, Япон хэлний сургалтаараа онцлогтой.',
 array['Grapeseed', 'STEM', 'Япон хэл'], 4500000, 4700000, true, true),

('Эхлэл ЕБС', 'ekhlel-ebs', 'ebs', 'БГД', '9919-9671', 'ekhlel.edu.mn',
 'Математик, Физик, Гадаад хэлний гүнзгийрүүлсэн сургалтаараа алдартай.',
 array['Математик', 'Физик', 'Гадаад хэл'], 3000000, 3300000, true, true),

('Орчлон олон улсын сургууль', 'orchlon-ois', 'ebs', 'ХУД', '7711-3322', 'main.orchlon.mn',
 'Cambridge IGCSE хөтөлбөрөөр олон улсын стандартын боловсрол олгодог.',
 array['Cambridge', 'IGCSE', 'Англи хэл'], 18000000, 18000000, true, true),

('ESM Сургууль', 'esm', 'ebs', 'БЗД', '7015-4015', 'esm.edu.mn',
 'IB (International Baccalaureate) хөтөлбөрөөр олон улсын боловсрол олгодог.',
 array['IB', 'Англи хэл'], 11000000, 11000000, false, true),

('Хобби сургууль', 'hobby-school', 'ebs', 'СБД', '1132-3739', 'hobby-school.mn',
 'IPC, IMYC, AP олон улсын хөтөлбөрүүдийг хэрэгжүүлдэг.',
 array['IPC', 'IMYC', 'AP'], 8500000, 10100000, true, true),

('Сант сургууль', 'sant-school', 'ebs', 'СБД', '1133-1030', 'sant.edu.mn',
 'Оксфорд, AP хөтөлбөрөөр боловсрол олгодог.',
 array['Oxford', 'AP', 'Англи хэл'], 7000000, 7000000, false, true),

('Гёте сургууль', 'goethe-school', 'ebs', 'СБД', '9985-5808', 'goetheschule.mn',
 'Герман, Англи хэл, DSD гэрчилгээний сургалттай.',
 array['Герман хэл', 'Англи хэл', 'DSD'], 5000000, 5000000, false, true),

('ASU Сургууль', 'asu-school', 'ebs', 'ХУД', '1134-8888', 'asu.edu.mn',
 'WASC магадлан итгэмжлэгдсэн, АНУ-ын хөтөлбөрөөр боловсрол олгодог.',
 array['WASC', 'АНУ хөтөлбөр', 'Англи хэл'], 14300000, 22000000, true, true),

('Глобал олон улсын сургууль', 'global-ois', 'ebs', 'БЗД', '9500-7298', 'global.edu.mn',
 'Cambridge IGCSE хөтөлбөрөөр боловсрол олгодог.',
 array['Cambridge', 'IGCSE', 'Англи хэл'], 10000000, 10000000, false, true),

('Логарифм сургууль', 'logarithm-school', 'ebs', null, '7711-0556', 'logarithm.edu.mn',
 'Математик, байгалийн ухааны гүнзгийрүүлсэн сургалтаараа онцлогтой.',
 array['Математик', 'Физик', 'Байгалийн ухаан'], 5400000, 5400000, false, false),

-- Их Дээд Сургууль
('АЧ Анагаах Ухааны Их Сургууль', 'ach-university', 'ids', 'СХД', '77119933', 'ach.edu.mn',
 'Монгол Улсын тэргүүлэх хувийн анагаахын дээд боловсролын байгууллага.',
 array['Анагаах ухаан'], null, null, true, true),

('Хүмүүнлэгийн Ухааны Их Сургууль', 'huis', 'ids', 'СБД', '11-318524', 'humanities.mn',
 'Хүмүүнлэгийн ухааны чиглэлээр боловсрол олгодог.',
 array['Хүмүүнлэг'], null, null, false, true),

('Их Засаг Олон Улсын Их Сургууль', 'ikhzasag', 'ids', 'БЗД', '70157768', 'ikhzasag.edu.mn',
 'Бизнес, эрх зүй, нийгмийн ухааны чиглэлүүдээр боловсрол олгодог.',
 array['Бизнес', 'Эрх зүй'], null, null, false, true),

('Этүгэн Их Сургууль', 'etugen-university', 'ids', 'СБД', '99116594', 'etugen.edu.mn',
 'Нягтлан бодох бүртгэл, санхүү, бизнесийн чиглэлийн тэргүүлэх дээд сургууль.',
 array['Санхүү', 'Бизнес', 'НББ'], null, null, false, true),

('Отгонтэнгэр Их Сургууль', 'otgontenger', 'ids', 'БЗД', '11-453944', 'otgontenger.edu.mn',
 'Мэдээллийн технологи, эдийн засаг, нийгмийн ухааны чиглэлүүдтэй.',
 array['МТ', 'Эдийн засаг'], null, null, false, true),

('СЭЗИС', 'sezis', 'ids', 'СБД', '11-458378', 'seas.edu.mn',
 'Санхүү эдийн засгийн шинжлэх ухааны их сургууль.',
 array['Санхүү', 'Эдийн засаг'], null, null, false, true),

('Улаанбаатарын Их Сургууль', 'ubis', 'ids', 'БЗД', '11-462028', 'ubuniversity.edu.mn',
 'Олон чиглэлийн дээд боловсролын байгууллага.',
 array['Олон чиглэл'], null, null, false, true),

-- Сургалтын байгууллага
('British Council', 'british-council', 'surgalt', 'СБД', '77307700', 'britishcouncil.mn',
 'Британийн зөвлөлийн Монгол дахь хэлний сургалтын төв. IELTS шалгалт авдаг.',
 array['Англи хэл', 'IELTS'], null, null, true, true),

('TOPIK Солонгос хэлний төв', 'topik-korean', 'surgalt', 'БЗД', '88008842', null,
 'Солонгос хэл, TOPIK шалгалтын бэлтгэл сургалт.',
 array['Солонгос хэл', 'TOPIK'], null, null, false, true),

('Нью Хоризон', 'new-horizon', 'surgalt', 'БЗД', '70117011', null,
 'Мэдээллийн технологийн мэргэжлийн сургалтын байгууллага.',
 array['МТ сургалт', 'Программчлал'], null, null, false, false),

('Форте хөгжмийн сургууль', 'forte-music', 'surgalt', 'СБД', '99770091', null,
 'Хөгжмийн мэргэжлийн сургалтын байгууллага.',
 array['Хөгжим', 'Хувийн сургалт'], null, null, false, false)

on conflict (slug) do nothing;
