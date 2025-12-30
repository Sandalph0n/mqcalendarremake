import json
from pprint import pprint
from datetime import datetime  # dùng để xử lý ngày tháng


date = []

# Danh sách toàn bộ các loại date_name có trong dữ liệu gốc
date_event_list = [
    'last date for results entry',
    'term classes resume',
    'last enrolment',
    'recess start',
    'earliest enrolment via estudent',
    'session break commences',
    'supplementary exams start',
    'first expansion date',
    'study period break',
    'result publication date',
    'last day of classes',
    'earliest admission date',
    'study period resumes',
    'last admission',
    'admit on offer acceptance cut-off date',
    'first application date via eapps',
    'recess end',
    'last withdraw date via estudent',
    'last application date via eapps',
    'study period start',
    'exams end',
    'last application',
    'last withdrawal',
    'last withdrawal without fail',
    'teaching census',
    'study week end',
    'term break commences',
    'session classes resume',
    'study week start',
    'supplementary exams end',
    'last enrol date via estudent',
    'payment due date',
    'exams start',
    'study period end'
]

# Chỉ giữ lại các mốc thời gian quan trọng cho sinh viên
filtered_date_list = [
    'study period start',       # bắt đầu kì học
    'recess start',             # bắt đầu nghỉ giữa kì
    'recess end',               # kết thúc nghỉ giữa kì
    'session classes resume',   # quay lại học sau recess
    'last day of classes',
    'exams start',
    'exams end',
    'study period end'
]

# Đọc dữ liệu gốc từ file general.json
with open("general.json") as fin:
    date = json.load(fin)

# Lọc dữ liệu:
# - campus North Ryde
# - thuộc Macquarie University
# - Session 1, 2, 3
# - dành cho sinh viên
# - date_name nằm trong filtered_date_list
filltered_northryde_dates = [
    d for d in date
    if d['location'] == 'North Ryde'
    and d['parent_calendar'] == "Macquarie University"
    and d["study_period"] in ["Session 1", "Session 2", "Session 3"]
    and d['students'] == 'Yes'
    and d['date_name'].lower() in filtered_date_list
]

cleaned_data = []

# Làm sạch dữ liệu và parse ngày tháng
for d in filltered_northryde_dates:
    newdate = {
        'study_period': d['study_period'],
        'date': d["date"],
        'date_name': d['date_name'].lower(),

        # Parse string ngày -> datetime để phục vụ việc sort
        # Lưu ý: format ngày trong dữ liệu là d/m/YYYY hoặc dd/mm/YYYY
        '_date_obj': datetime.strptime(d["date"], "%d/%m/%Y")
    }
    cleaned_data.append(newdate)

# =========================
# SORT THEO NGÀY THÁNG
# =========================
# Sắp xếp toàn bộ cleaned_data theo ngày tăng dần
cleaned_data.sort(key=lambda x: x['_date_obj'])

# Xoá field datetime trước khi dump ra JSON
for d in cleaned_data:
    del d['_date_obj']

# Kiểm tra số lượng record sau khi xử lý
pprint(len(cleaned_data))

# Ghi ra file JSON cuối cùng
with open("MacquarieCalendarEntry.json", "w") as fout:
    json.dump(cleaned_data, fout, indent=4)